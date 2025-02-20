from sqlalchemy import Column, String, Boolean, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Draft(BaseModel):
    __tablename__ = "drafts"

    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    email_id = Column(ForeignKey("emails.id", ondelete="SET NULL"), nullable=True)
    
    subject = Column(String)
    recipients = Column(JSON)  # List of recipient emails
    body_text = Column(Text)
    body_html = Column(Text, nullable=True)
    
    # Draft metadata
    is_sent = Column(Boolean, default=False)
    gmail_draft_id = Column(String, nullable=True)  # Gmail's draft ID if saved
    version = Column(Integer, default=1)  # Version number for multiple drafts
    prompt = Column(Text, nullable=True)  # User prompt used to generate this draft
    
    # LLM-generated metadata
    tone = Column(String, nullable=True)  # e.g., "Professional", "Casual", "Formal"
    suggestions = Column(JSON, nullable=True)  # List of improvement suggestions
    
    # Relationships
    user = relationship("User", back_populates="drafts")
    email = relationship("Email", back_populates="drafts")

    def __repr__(self):
        return f"<Draft {self.subject} v{self.version}>" 