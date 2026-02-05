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

from app.database import get_db, init_db, AsyncSessionLocal
from app.events import event_manager
from app.models import Ticket
from app.schemas import TicketCreate, TicketResponse, TicketListResponse, TicketUpdate
from app.services import process_ticket_with_ai, recover_stuck_tickets

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
    
    # Recover stuck tickets
    logger.info("Recovering stuck tickets...")
    async with AsyncSessionLocal() as session:
        await recover_stuck_tickets(session)
    logger.info("Recovery check complete")
    
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


@app.post("/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(
    ticket_data: TicketCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new support ticket.
    
    Returns 201 immediately with ticket ID and 'pending' status.
    AI processing happens asynchronously in the background.
    """
    try:
        # Create new ticket
        new_ticket = Ticket(raw_content=ticket_data.raw_content)
        db.add(new_ticket)
        await db.commit()
        await db.refresh(new_ticket)
        
        logger.info(f"Created ticket {new_ticket.id}")
        
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
    db: AsyncSession = Depends(get_db),
):
    """List all tickets with pagination."""
    try:
        # Get total count
        count_result = await db.execute(select(Ticket))
        total = len(count_result.scalars().all())
        
        # Get paginated tickets
        result = await db.execute(
            select(Ticket)
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
    db: AsyncSession = Depends(get_db),
):
    """Update a ticket's draft response or other fields."""
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
    db: AsyncSession = Depends(get_db),
):
    """Mark a ticket as resolved."""
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
        # ticket.resolved_by can be set when auth is implemented
        
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
