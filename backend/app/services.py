"""Business logic and background task services."""
import logging
import os
import json
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from openai import AsyncOpenAI
from dotenv import load_dotenv

from app.models import Ticket, TicketStatus

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def analyze_ticket_with_llm(ticket_content: str) -> dict:
    """
    Call OpenAI GPT-4o-mini to analyze ticket and return structured data.
    
    Args:
        ticket_content: The raw ticket content to analyze
        
    Returns:
        dict with keys: category, urgency, sentiment_score, draft_response
    """
    try:
        system_prompt = """You are an AI support ticket analyzer. Analyze the support ticket and provide:
1. Category: One of [Technical, Billing, Account, General]
2. Urgency: One of [Low, Medium, High, Critical]
3. Sentiment Score: Integer from 1-10 (1=very negative, 10=very positive)
4. Draft Response: A professional, helpful response to the customer

Return your response as a JSON object with keys: category, urgency, sentiment_score, draft_response"""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this support ticket:\n\n{ticket_content}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        # Parse JSON response
        result = json.loads(response.choices[0].message.content)
        
        logger.info(f"LLM analysis complete: {result.get('category')}, {result.get('urgency')}")
        
        return {
            "category": result.get("category", "General"),
            "urgency": result.get("urgency", "Medium"),
            "sentiment_score": int(result.get("sentiment_score", 5)),
            "draft_response": result.get("draft_response", "Thank you for contacting support. We will review your request and respond shortly."),
        }
        
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        # Return default values on error
        return {
            "category": "General",
            "urgency": "Medium",
            "sentiment_score": 5,
            "draft_response": "Thank you for contacting support. We will review your request and respond shortly.",
        }


async def process_ticket_with_ai(ticket_id: UUID, db_session: AsyncSession):
    """
    Background task to process ticket with AI.
    
    Calls OpenAI GPT-4o-mini to analyze and categorize the ticket.
    
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
        
        # Call OpenAI API for analysis
        analysis = await analyze_ticket_with_llm(ticket.raw_content)
        
        # Update ticket with AI results
        ticket.category = analysis["category"]
        ticket.urgency = analysis["urgency"]
        ticket.sentiment_score = analysis["sentiment_score"]
        ticket.draft_response = analysis["draft_response"]
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
