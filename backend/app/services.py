"""Business logic and background task services."""
import asyncio
import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Ticket, TicketStatus

logger = logging.getLogger(__name__)


async def process_ticket_with_ai(ticket_id: UUID, db_session: AsyncSession):
    """
    Background task to process ticket with AI.
    
    This is a mock implementation that simulates AI processing.
    In production, this would call an actual LLM API.
    
    Args:
        ticket_id: UUID of the ticket to process
        db_session: Database session for updates
    """
    try:
        logger.info(f"Starting AI processing for ticket {ticket_id}")
        
        # Update status to processing
        result = await db_session.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = result.scalar_one_or_none()
        
        if not ticket:
            logger.error(f"Ticket {ticket_id} not found")
            return
        
        ticket.status = TicketStatus.PROCESSING
        await db_session.commit()
        
        # Simulate AI processing delay (3 seconds)
        await asyncio.sleep(3)
        
        # Mock AI results
        ticket.category = "Technical"
        ticket.urgency = "High"
        ticket.sentiment_score = 75
        ticket.draft_response = (
            f"Thank you for contacting support. We've reviewed your request: "
            f"'{ticket.raw_content[:100]}...' and categorized it as a Technical issue "
            f"with High urgency. Our team will respond within 24 hours."
        )
        ticket.status = TicketStatus.COMPLETED
        
        await db_session.commit()
        logger.info(f"Successfully processed ticket {ticket_id}")
        
    except Exception as e:
        logger.error(f"Error processing ticket {ticket_id}: {str(e)}")
        
        # Update ticket status to failed
        try:
            result = await db_session.execute(
                select(Ticket).where(Ticket.id == ticket_id)
            )
            ticket = result.scalar_one_or_none()
            if ticket:
                ticket.status = TicketStatus.FAILED
                await db_session.commit()
        except Exception as rollback_error:
            logger.error(f"Failed to update ticket status to failed: {str(rollback_error)}")
