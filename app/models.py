from sqlalchemy import Column, String, Boolean, JSON, Integer, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    google_credentials = Column(JSON, nullable=True)
    gmail_sync_enabled = Column(Boolean, default=False)
    last_sync_timestamp = Column(String, nullable=True)
    
    emails = relationship("Email", back_populates="user")

class Email(Base):
    __tablename__ = "emails"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    gmail_id = Column(String, index=True)
    thread_id = Column(String, index=True)
    subject = Column(String)
    sender = Column(String)
    recipients = Column(String)  # JSON string
    snippet = Column(String)
    body_text = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    labels = Column(String)  # JSON string
    is_read = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)
    created_at = Column(String)
    
    # Analysis fields
    category = Column(String, nullable=True)
    priority_score = Column(Integer, nullable=True)
    sentiment = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    action_items = Column(String, nullable=True)  # JSON string
    
    user = relationship("User", back_populates="emails") 