from sqlalchemy import Column, String, Boolean, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Email(BaseModel):
    __tablename__ = "emails"

    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    gmail_id = Column(String, index=True)  # Gmail's message ID
    thread_id = Column(String, index=True)  # Gmail's thread ID
    
    subject = Column(String)
    sender = Column(String)
    recipients = Column(JSON)  # List of recipient emails
    
    snippet = Column(Text)  # Email preview
    body_text = Column(Text, nullable=True)  # Plain text body
    body_html = Column(Text, nullable=True)  # HTML body
    
    labels = Column(JSON)  # Gmail labels
    is_read = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)
    
    # LLM-generated metadata
    category = Column(String, nullable=True)  # e.g., "Work", "Personal", "Newsletter"
    sentiment = Column(String, nullable=True)  # e.g., "Positive", "Negative", "Neutral"
    priority_score = Column(Integer, nullable=True)  # 1-5 priority score
    summary = Column(Text, nullable=True)  # LLM-generated summary
    action_items = Column(JSON, nullable=True)  # List of extracted action items
    
    # Relationships
    user = relationship("User", back_populates="emails")
    drafts = relationship("Draft", back_populates="email")

    def __repr__(self):
        return f"<Email {self.subject}>" 