"""SQLAlchemy models for the application."""
import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base


class TicketStatus(str, enum.Enum):
    """Ticket processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


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

    def __repr__(self):
        return f"<Ticket(id={self.id}, status={self.status}, created_at={self.created_at})>"
