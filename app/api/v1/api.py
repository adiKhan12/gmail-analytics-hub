from fastapi import APIRouter
from app.api.v1.endpoints import auth, emails, drafts, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(emails.router, prefix="/emails", tags=["emails"])
api_router.include_router(drafts.router, prefix="/drafts", tags=["drafts"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"]) 