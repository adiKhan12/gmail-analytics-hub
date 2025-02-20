from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

# Create data directory if it doesn't exist
data_dir = Path("data")
data_dir.mkdir(exist_ok=True)

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///data/email_planner.db")
    
    # DeepSeek API settings
    DEEPSEEK_API_KEY: str = os.environ.get("DEEPSEEK_API_KEY", "")
    DEEPSEEK_API_BASE: str = os.environ.get("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")
    
    # JWT Settings
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = os.environ.get("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/callback/google")
    
    # Frontend URL for CORS and redirects
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"

settings = Settings() 