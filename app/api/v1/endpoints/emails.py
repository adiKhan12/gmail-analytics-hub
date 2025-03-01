from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Email
from app.services.gmail import sync_emails
from app.services.llm import analyze_email
from typing import List, Optional
import json
from sqlalchemy import or_

router = APIRouter()

@router.post("/sync")
async def sync_gmail_emails(
    db: Session = Depends(get_db),
    limit: Optional[int] = 50
):
    """
    Sync emails from Gmail to local database
    """
    # For now, we'll just use the first user (we can add proper auth later)
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No authenticated user found"
        )
    
    result = sync_emails(db, user, limit)
    return result

@router.post("/analyze/{email_id}")
async def analyze_single_email(
    email_id: int,
    db: Session = Depends(get_db)
):
    """
    Analyze a single email using the LLM
    """
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    # Analyze email content
    analysis = await analyze_email(
        subject=email.subject,
        body=email.body_text or email.snippet,
        sender=email.sender
    )
    
    if analysis["success"]:
        # Update email with analysis results
        email.category = analysis["analysis"].get("category")
        email.priority_score = analysis["analysis"].get("priority_score")
        email.sentiment = analysis["analysis"].get("sentiment")
        email.summary = analysis["analysis"].get("summary")
        email.action_items = json.dumps(analysis["analysis"].get("action_items", []))
        db.commit()
        
        return {
            "success": True,
            "email_id": email_id,
            "analysis": analysis["analysis"]
        }
    else:
        return {
            "success": False,
            "email_id": email_id,
            "error": analysis.get("error", "Analysis failed")
        }

@router.post("/analyze")
async def analyze_email_batch(
    db: Session = Depends(get_db),
    limit: int = 50
):
    """
    Analyze a batch of unanalyzed emails
    """
    # Get emails that haven't been categorized yet
    emails = db.query(Email).filter(
        Email.category.is_(None)
    ).limit(limit).all()
    
    results = []
    for email in emails:
        analysis = await analyze_email(
            subject=email.subject,
            body=email.body_text or email.snippet,
            sender=email.sender
        )
        
        if analysis["success"]:
            # Update email with analysis results
            email.category = analysis["analysis"].get("category")
            email.priority_score = analysis["analysis"].get("priority_score")
            email.sentiment = analysis["analysis"].get("sentiment")
            email.summary = analysis["analysis"].get("summary")
            email.action_items = json.dumps(analysis["analysis"].get("action_items", []))
            
            results.append({
                "email_id": email.id,
                "success": True,
                "analysis": analysis["analysis"]
            })
        else:
            results.append({
                "email_id": email.id,
                "success": False,
                "error": analysis.get("error", "Analysis failed")
            })
    
    db.commit()
    return {
        "total_processed": len(emails),
        "results": results
    }

@router.get("/list")
async def list_emails(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    min_priority: Optional[int] = None,
    search: Optional[str] = None,
    sender: Optional[str] = None,
    has_action_items: Optional[bool] = None
):
    """
    List emails from local database with optional filters and search
    """
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No authenticated user found"
        )
    
    # Build query with filters
    query = db.query(Email).filter(Email.user_id == user.id)
    
    if category:
        query = query.filter(Email.category == category)
    if min_priority:
        query = query.filter(Email.priority_score >= min_priority)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Email.subject.ilike(search_term),
                Email.body_text.ilike(search_term),
                Email.snippet.ilike(search_term)
            )
        )
    if sender:
        query = query.filter(Email.sender.ilike(f"%{sender}%"))
    if has_action_items is not None:
        if has_action_items:
            query = query.filter(Email.action_items != '[]', Email.action_items.isnot(None))
        else:
            query = query.filter(or_(Email.action_items == '[]', Email.action_items.is_(None)))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting and pagination
    emails = query.order_by(
        Email.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "emails": [{
            "id": email.id,
            "gmail_id": email.gmail_id,
            "subject": email.subject,
            "sender": email.sender,
            "snippet": email.snippet,
            "is_read": email.is_read,
            "is_important": email.is_important,
            "category": email.category,
            "priority_score": email.priority_score,
            "sentiment": email.sentiment,
            "summary": email.summary,
            "action_items": json.loads(email.action_items) if email.action_items else [],
            "created_at": email.created_at.isoformat() if email.created_at else None
        } for email in emails]
    } 