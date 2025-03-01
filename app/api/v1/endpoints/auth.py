from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models import User
from typing import Optional
import json

router = APIRouter()

# OAuth2 configuration for Google
SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/me")
async def get_current_user(db: Session = Depends(get_db)):
    """
    Get the current authenticated user
    """
    # For now, just return the first user
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name if hasattr(user, 'name') else user.email.split('@')[0],
        "picture": user.picture if hasattr(user, 'picture') else None,
        "is_active": user.is_active
    }

@router.post("/logout")
async def logout(response: Response, db: Session = Depends(get_db)):
    """
    Logout the current user
    """
    # For now, just return success
    # In a real app, you'd clear the session/token
    return {"message": "Successfully logged out"}

@router.get("/login/google")
async def login_google():
    """
    Initialize Google OAuth2 flow and return authorization URL
    """
    # Print configuration for debugging
    print(f"Client ID: {settings.GOOGLE_CLIENT_ID}")
    print(f"Redirect URI: {settings.GOOGLE_REDIRECT_URI}")
    
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        }
    }
    
    print("Full client config:", json.dumps(client_config, indent=2))
    
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI  # Explicitly set redirect_uri
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    print(f"Generated authorization URL: {authorization_url}")
    return {"authorization_url": authorization_url}

@router.get("/callback/google")
async def google_auth_callback(
    code: str, 
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Handle Google OAuth callback and create user session
    """
    try:
        client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            }
        }
        
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Use the credentials to create a Gmail service
        service = build('gmail', 'v1', credentials=credentials)
        
        # Get user info from Google
        userinfo_service = build('oauth2', 'v2', credentials=credentials)
        user_info = userinfo_service.userinfo().get().execute()
        email = user_info.get('email')
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            user = User(
                email=email,
                name=user_info.get('name'),
                picture=user_info.get('picture'),
                google_credentials={
                    'token': credentials.token,
                    'refresh_token': credentials.refresh_token,
                    'token_uri': credentials.token_uri,
                    'client_id': credentials.client_id,
                    'client_secret': credentials.client_secret,
                    'scopes': credentials.scopes
                },
                gmail_sync_enabled=True
            )
            db.add(user)
        else:
            user.name = user_info.get('name')
            user.picture = user_info.get('picture')
            user.google_credentials = {
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            }
            user.gmail_sync_enabled = True
        
        db.commit()
        
        # Redirect to frontend dashboard
        return RedirectResponse(url="http://localhost:5173")
        
    except Exception as e:
        print(f"Error in callback: {str(e)}")  # Add debug print
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to complete Google OAuth flow: {str(e)}"
        ) 