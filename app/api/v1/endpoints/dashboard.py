from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models import User, Email
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    days: int = 7  # Default to last 7 days
):
    """
    Get email dashboard statistics
    """
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No authenticated user found"
        )
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Basic stats
    total_emails = db.query(Email).filter(Email.user_id == user.id).count()
    unread_emails = db.query(Email).filter(
        Email.user_id == user.id,
        Email.is_read == False
    ).count()
    
    # Category distribution
    category_stats = db.query(
        Email.category,
        func.count(Email.id).label('count')
    ).filter(
        Email.user_id == user.id,
        Email.category.isnot(None)
    ).group_by(Email.category).all()
    
    # Priority distribution
    priority_stats = db.query(
        Email.priority_score,
        func.count(Email.id).label('count')
    ).filter(
        Email.user_id == user.id,
        Email.priority_score.isnot(None)
    ).group_by(Email.priority_score).all()
    
    # Sentiment distribution
    sentiment_stats = db.query(
        Email.sentiment,
        func.count(Email.id).label('count')
    ).filter(
        Email.user_id == user.id,
        Email.sentiment.isnot(None)
    ).group_by(Email.sentiment).all()
    
    # Recent high-priority emails
    high_priority_emails = db.query(Email).filter(
        Email.user_id == user.id,
        Email.priority_score >= 4
    ).order_by(desc(Email.created_at)).limit(5).all()
    
    # Pending actions
    emails_with_actions = db.query(Email).filter(
        Email.user_id == user.id,
        Email.action_items != '[]',
        Email.action_items.isnot(None)
    ).order_by(desc(Email.created_at)).limit(5).all()
    
    # Count of analyzed emails (emails with category assigned)
    analyzed_emails_count = db.query(Email).filter(
        Email.user_id == user.id,
        Email.category.isnot(None)
    ).count()
    
    return {
        "overview": {
            "total_emails": total_emails,
            "unread_emails": unread_emails,
            "analyzed_emails": analyzed_emails_count,
            "last_sync": user.last_sync_timestamp
        },
        "categories": {
            stat.category: stat.count for stat in category_stats
        },
        "priorities": {
            str(stat.priority_score): stat.count for stat in priority_stats
        },
        "sentiments": {
            stat.sentiment: stat.count for stat in sentiment_stats
        },
        "high_priority": [{
            "id": email.id,
            "subject": email.subject,
            "sender": email.sender,
            "priority_score": email.priority_score,
            "category": email.category
        } for email in high_priority_emails],
        "pending_actions": [{
            "id": email.id,
            "subject": email.subject,
            "action_items": email.action_items
        } for email in emails_with_actions]
    }

@router.get("/timeline")
async def get_email_timeline(
    db: Session = Depends(get_db),
    days: int = 7
):
    """
    Get email timeline statistics
    """
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No authenticated user found"
        )
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily email counts
    daily_counts = db.query(
        func.date(Email.created_at).label('date'),
        func.count(Email.id).label('count')
    ).filter(
        Email.user_id == user.id,
        Email.created_at >= start_date,
        Email.created_at <= end_date
    ).group_by(
        func.date(Email.created_at)
    ).all()
    
    return {
        "timeline": [{
            "date": str(stat.date),
            "count": stat.count
        } for stat in daily_counts]
    } 