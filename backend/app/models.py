"""SQLAlchemy models for the application."""
import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class TicketStatus(str, enum.Enum):
    """Ticket processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class UserRole(str, enum.Enum):
    """User roles for access control."""
    CUSTOMER = "customer"
    AGENT = "agent"
    ADMIN = "admin"


class User(Base):
    """User model for authentication and authorization."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    plan = Column(String(50), nullable=True)  # For customers: Basic, Pro, Enterprise
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationship to tickets
    tickets = relationship("Ticket", back_populates="customer")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class Ticket(Base):
    """Ticket model for support requests."""
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    raw_content = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.PENDING, nullable=False)
    category = Column(String(100), nullable=True)
    urgency = Column(String(50), nullable=True)
    sentiment_score = Column(Integer, nullable=True)
    draft_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Customer relationship
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    customer = relationship("User", back_populates="tickets")
    
    # Resolution tracking
    resolved = Column(Boolean, default=False, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)

    def __repr__(self):
        return f"<Ticket(id={self.id}, status={self.status}, resolved={self.resolved}, created_at={self.created_at})>"
