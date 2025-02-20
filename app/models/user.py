from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # OAuth related fields
    google_credentials = Column(JSON)  # Store OAuth credentials
    gmail_sync_enabled = Column(Boolean, default=False)
    last_sync_timestamp = Column(String, nullable=True)  # Store ISO format timestamp
    
    # Relationships
    emails = relationship("Email", back_populates="user", cascade="all, delete-orphan")
    drafts = relationship("Draft", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>" 