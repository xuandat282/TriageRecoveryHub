"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.models import TicketStatus


class TicketCreate(BaseModel):
    """Schema for creating a new ticket."""
    raw_content: str = Field(..., min_length=1, description="The raw content of the support ticket")


class TicketUpdate(BaseModel):
    """Schema for updating a ticket."""
    draft_response: Optional[str] = Field(None, description="Updated draft response")
    category: Optional[str] = Field(None, description="Updated category")
    urgency: Optional[str] = Field(None, description="Updated urgency")


class CustomerInfo(BaseModel):
    """Embedded customer info for ticket response."""
    id: UUID
    name: str
    email: str
    plan: Optional[str] = None

    class Config:
        from_attributes = True


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
    resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    customer_id: Optional[UUID] = None
    customer: Optional[CustomerInfo] = None

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    """Schema for listing tickets."""
    tickets: list[TicketResponse]
    total: int
