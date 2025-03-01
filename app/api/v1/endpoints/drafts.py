from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Email
from app.services.llm import generate_email_draft
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class DraftRequest(BaseModel):
    email_id: str
    mode: str  # 'reply' or 'forward'
    instructions: Optional[str] = None

class DraftResponse(BaseModel):
    success: bool
    draft: Optional[str] = None
    error: Optional[str] = None

@router.get("/test")
async def test_endpoint():
    """
    Test endpoint to verify the API is working
    """
    return {"status": "ok", "message": "Drafts endpoint is working"}

@router.post("/generate", response_model=DraftResponse)
async def generate_draft(
    request: DraftRequest,
    db: Session = Depends(get_db)
):
    """
    Generate an email draft based on an existing email
    """
    try:
        # Get the original email
        email = db.query(Email).filter(Email.id == request.email_id).first()
        
        if not email:
            return DraftResponse(
                success=False,
                error=f"Email with ID {request.email_id} not found"
            )
        
        # Generate the draft using the LLM service
        result = await generate_email_draft(
            email=email,
            mode=request.mode,
            instructions=request.instructions
        )
        
        if result["success"]:
            return DraftResponse(
                success=True,
                draft=result["draft"]
            )
        else:
            return DraftResponse(
                success=False,
                error=result["error"]
            )
            
    except Exception as e:
        return DraftResponse(
            success=False,
            error=f"Failed to generate draft: {str(e)}"
        ) 