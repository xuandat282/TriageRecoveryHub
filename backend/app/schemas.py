"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models import TicketStatus, UserRole


# ============================================================================
# Authentication Schemas
# ============================================================================

class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.CUSTOMER


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for user response."""
    id: UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Ticket Schemas
# ============================================================================

class TicketCreate(BaseModel):
    """Schema for creating a new ticket."""
    raw_content: str = Field(..., min_length=1, description="The raw content of the support ticket")


class TicketUpdate(BaseModel):
    """Schema for updating a ticket."""
    draft_response: Optional[str] = Field(None, description="Updated draft response")
    category: Optional[str] = Field(None, description="Updated category")
    urgency: Optional[str] = Field(None, description="Updated urgency")


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
    created_by: Optional[UUID] = None
    resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    """Schema for listing tickets."""
    tickets: list[TicketResponse]
    total: int
