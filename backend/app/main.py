"""FastAPI main application."""
import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    require_role,
    verify_password,
)
from app.database import get_db, init_db, AsyncSessionLocal
from app.events import event_manager
from app.models import Ticket, User, UserRole
from app.schemas import (
    TicketCreate,
    TicketResponse,
    TicketListResponse,
    TicketUpdate,
    UserCreate,
    UserLogin,
    Token,
    UserResponse,
)
from app.services import process_ticket_with_ai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup: Initialize database
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized successfully")
    yield
    # Shutdown: cleanup if needed
    logger.info("Shutting down application...")


# Create FastAPI app
app = FastAPI(
    title="AI Support Triage Hub",
    description="API for managing support tickets with AI-powered triage",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "AI Support Triage Hub API", "status": "running"}


# ============================================================================
# Authentication Endpoints
# ============================================================================

@app.post("/auth/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user.
    
    Creates a new user account with hashed password.
    Default role is CUSTOMER unless specified.
    """
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info(f"Registered new user: {new_user.email} (role: {new_user.role})")
    
    return new_user


@app.post("/auth/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Login and receive JWT access token.
    
    Returns a JWT token that must be included in subsequent requests
    as: Authorization: Bearer <token>
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    logger.info(f"User logged in: {user.email}")
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    """
    return current_user


# ============================================================================
# Ticket Endpoints
# ============================================================================


@app.post("/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(
    ticket_data: TicketCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new support ticket.
    
    Requires authentication. Returns 201 immediately with ticket ID and 'pending' status.
    AI processing happens asynchronously in the background.
    """
    try:
        # Create new ticket with user association
        new_ticket = Ticket(
            raw_content=ticket_data.raw_content,
            created_by=current_user.id,
        )
        db.add(new_ticket)
        await db.commit()
        await db.refresh(new_ticket)
        
        logger.info(f"Created ticket {new_ticket.id} by user {current_user.email}")
        
        # Schedule background task for AI processing
        # Create a new session for the background task
        async def background_task():
            async with AsyncSessionLocal() as bg_session:
                await process_ticket_with_ai(new_ticket.id, bg_session)
        
        background_tasks.add_task(background_task)
        
        return new_ticket
        
    except Exception as e:
        logger.error(f"Error creating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")


@app.get("/tickets", response_model=TicketListResponse)
async def list_tickets(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List tickets with role-based filtering.
    
    - AGENT/ADMIN: See all tickets
    - CUSTOMER: See only their own tickets
    
    Requires authentication.
    """
    try:
        # Build query based on user role
        query = select(Ticket)
        
        # Customers can only see their own tickets
        if current_user.role == UserRole.CUSTOMER:
            query = query.where(Ticket.created_by == current_user.id)
        
        # Get total count
        count_result = await db.execute(query)
        total = len(count_result.scalars().all())
        
        # Get paginated tickets
        result = await db.execute(
            query
            .order_by(Ticket.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        tickets = result.scalars().all()
        
        return TicketListResponse(tickets=tickets, total=total)
        
    except Exception as e:
        logger.error(f"Error listing tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list tickets")


@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific ticket by ID."""
    try:
        result = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = result.scalar_one_or_none()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return ticket
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get ticket")


@app.patch("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_update: TicketUpdate,
    current_user: User = Depends(require_role(UserRole.AGENT, UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a ticket's draft response or other fields.
    
    Requires AGENT or ADMIN role.
    """
    try:
        result = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = result.scalar_one_or_none()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Update fields if provided
        if ticket_update.draft_response is not None:
            ticket.draft_response = ticket_update.draft_response
        if ticket_update.category is not None:
            ticket.category = ticket_update.category
        if ticket_update.urgency is not None:
            ticket.urgency = ticket_update.urgency
        
        await db.commit()
        await db.refresh(ticket)
        
        logger.info(f"Updated ticket {ticket_id}")
        return ticket
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update ticket")


@app.post("/tickets/{ticket_id}/resolve", response_model=TicketResponse)
async def resolve_ticket(
    ticket_id: str,
    current_user: User = Depends(require_role(UserRole.AGENT, UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a ticket as resolved.
    
    Requires AGENT or ADMIN role.
    """
    try:
        result = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = result.scalar_one_or_none()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        if ticket.resolved:
            raise HTTPException(status_code=400, detail="Ticket already resolved")
        
        # Mark as resolved
        ticket.resolved = True
        ticket.resolved_at = datetime.utcnow()
        ticket.resolved_by = current_user.email
        
        await db.commit()
        await db.refresh(ticket)
        
        logger.info(f"Resolved ticket {ticket_id}")
        return ticket
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to resolve ticket")


@app.get("/events")
async def stream_ticket_events():
    """
    Server-Sent Events endpoint for real-time ticket updates.
    
    Clients connect to this endpoint and receive push notifications
    when tickets are processed or updated.
    """
    async def event_generator():
        queue = await event_manager.connect()
        try:
            while True:
                message = await queue.get()
                yield f"data: {message}\n\n"
        except asyncio.CancelledError:
            event_manager.disconnect(queue)
            
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
