"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.models import TicketStatus


class TicketCreate(BaseModel):
    """Schema for creating a new ticket."""
    raw_content: str = Field(..., min_length=1, description="The raw content of the support ticket")


class TicketResponse(BaseModel):
    """Schema for ticket response."""
    id: UUID
    raw_content: str
    status: TicketStatus
    category: Optional[str] = None
    urgency: Optional[str] = None
    sentiment_score: Optional[int] = None
    draft_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    """Schema for listing tickets."""
    tickets: list[TicketResponse]
    total: int
