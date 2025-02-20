from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    """
    Test endpoint to verify the API is working
    """
    return {"status": "ok", "message": "Drafts endpoint is working"} 