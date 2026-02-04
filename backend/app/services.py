"""Business logic and background task services."""
import json
import logging
import os
from uuid import UUID

from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import google.generativeai as genai

from app.events import event_manager
from app.models import Ticket, TicketStatus

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your-gemini-api-key-here":
    genai.configure(api_key=GEMINI_API_KEY)


async def analyze_ticket_with_llm(ticket_content: str) -> dict:
    """
    Analyze ticket using Gemini API.
    
    Args:
        ticket_content: The raw ticket content to analyze
        
    Returns:
        dict with keys: category, urgency, sentiment_score, draft_response
    """
    try:
        # Check if API key is configured
        if not GEMINI_API_KEY or GEMINI_API_KEY == "[GCP_API_KEY]":
            logger.warning("Gemini API key not configured, using fallback analysis")
            return _fallback_analysis(ticket_content)
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Create prompt for ticket analysis
        prompt = f"""You are an expert support agent and ticket analyzer. Your goal is to accurately categorize tickets and draft empathetic, professional responses.

Analyze the following support ticket step-by-step:

1. **Categorization**: Match the content to the best category:
   - *Technical*: Bugs, crashes, errors, feature broken.
   - *Billing*: Invoices, charges, refunds, pricing.
   - *Account*: Login issues, password reset, profile updates.
   - *Spam*: Unsolicited offers, ads, nonsense content.
   - *General*: Product questions, feedback, or effectively "Other".

2. **Urgency Assessment**:
   - *Critical*: System down, data loss, security breach, financial loss.
   - *High*: Core feature broken, cannot work, frustrated VIP.
   - *Medium*: Non-critical bug, question, account update.
   - *Low*: Minor feedback, feature request, spam.

3. **Sentiment Analysis**: Score from 1 (Furious/Abusive) to 10 (Delighted).
   - < 4: Negative/Frustrated
   - 4-6: Neutral/Matter-of-fact
   - > 6: Positive/Happy

4. **Draft Response**: Write a concise, professional reply.
   - Acknowledge the specific issue.
   - Match the user's tone (be empathetic if they are frustrated).
   - If it's *Spam*, set draft_response to "N/A".

Return your result as a JSON object with these exact keys: `category`, `urgency`, `sentiment_score`, `draft_response`.

Support Ticket:
{ticket_content}

Respond ONLY with valid JSON."""

        # Call Gemini API
        response = model.generate_content(prompt)
        
        # Parse JSON response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        
        logger.info(f"Gemini analysis complete: {result.get('category')}, {result.get('urgency')}")
        
        return {
            "category": result.get("category", "General"),
            "urgency": result.get("urgency", "Medium"),
            "sentiment_score": int(result.get("sentiment_score", 5)),
            "draft_response": result.get("draft_response", "Thank you for contacting support. We will review your request and respond shortly."),
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {str(e)}")
        return _fallback_analysis(ticket_content)
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return _fallback_analysis(ticket_content)


async def _broadcast_ticket_event(ticket_id: UUID, status: str):
    """
    Broadcast ticket status update via Server-Sent Events.
    
    Args:
        ticket_id: UUID of the ticket
        status: New status of the ticket
    """
    await event_manager.broadcast(json.dumps({
        "type": "ticket_update",
        "ticket_id": str(ticket_id),
        "status": status
    }))


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
        
        # Call Gemini API for analysis
        analysis = await analyze_ticket_with_llm(ticket.raw_content)
        
        # Update ticket with AI results
        ticket.category = analysis["category"]
        ticket.urgency = analysis["urgency"]
        ticket.sentiment_score = analysis["sentiment_score"]
        ticket.draft_response = analysis["draft_response"]
        ticket.status = TicketStatus.COMPLETED
        
        await db_session.commit()
        logger.info(f"Successfully processed ticket {ticket_id}")

        # Broadcast completion event
        await _broadcast_ticket_event(ticket_id, "completed")
        
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
                
                # Broadcast failure event
                await _broadcast_ticket_event(ticket_id, "failed")
        except Exception as rollback_error:
            logger.error(f"Failed to update ticket status to failed: {str(rollback_error)}")

def _fallback_analysis(ticket_content: str) -> dict:
    """
    Fallback analysis when Gemini API is unavailable.
    
    Args:
        ticket_content: The raw ticket content to analyze
        
    Returns:
        dict with keys: category, urgency, sentiment_score, draft_response
    """
    logger.info("Using fallback analysis (Gemini API unavailable)")
    
    content_lower = ticket_content.lower()
    
    # Simple keyword-based categorization
    if any(word in content_lower for word in ["bug", "error", "crash", "broken"]):
        category = "Technical"
        urgency = "High"
    elif any(word in content_lower for word in ["bill", "charge", "payment", "refund"]):
        category = "Billing"
        urgency = "Medium"
    elif any(word in content_lower for word in ["account", "login", "password", "access"]):
        category = "Account"
        urgency = "Medium"
    elif any(word in content_lower for word in ["norton", "casino", "lottery", "prize", "unclaimed"]):
        category = "Spam"
        urgency = "Low"
    else:
        category = "General"
        urgency = "Low"
    
    # Simple sentiment based on negative words
    negative_words = ["angry", "frustrated", "terrible", "worst", "hate"]
    sentiment_score = 7 if not any(word in content_lower for word in negative_words) else 3
    
    draft_response = f"Thank you for contacting support regarding your {category.lower()} issue. We understand this is important to you and will address it promptly."
    
    return {
        "category": category,
        "urgency": urgency,
        "sentiment_score": sentiment_score,
        "draft_response": draft_response,
    }
