from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.orm import Session
from app.models import User, Email
from typing import Dict, Any
import base64
import email
from datetime import datetime
import json

def create_gmail_service(credentials_dict: Dict[str, Any]) -> Any:
    """Create and return a Gmail service instance from stored credentials"""
    try:
        credentials = Credentials(
            token=credentials_dict['token'],
            refresh_token=credentials_dict['refresh_token'],
            token_uri=credentials_dict['token_uri'],
            client_id=credentials_dict['client_id'],
            client_secret=credentials_dict['client_secret'],
            scopes=credentials_dict['scopes']
        )
        return build('gmail', 'v1', credentials=credentials)
    except Exception as e:
        # Handle credential creation errors
        raise Exception(f"Failed to create Gmail service: {str(e)}")

def parse_email_body(payload):
    """Extract email body from Gmail API message payload"""
    if payload.get('body', {}).get('data'):
        return base64.urlsafe_b64decode(payload['body']['data']).decode()
    
    # Handle multipart messages
    if payload.get('parts'):
        for part in payload['parts']:
            if part['mimeType'] in ['text/plain', 'text/html']:
                if part['body'].get('data'):
                    return base64.urlsafe_b64decode(part['body']['data']).decode()
    return ""

def sync_emails(db: Session, user: User, limit: int = 50) -> Dict[str, Any]:
    """
    Sync emails from Gmail to local database
    Returns summary of sync operation
    """
    try:
        service = create_gmail_service(user.google_credentials)
        
        # Get list of emails
        try:
            results = service.users().messages().list(
                userId='me',
                maxResults=limit,
                q='in:inbox'  # Only sync inbox messages for now
            ).execute()
        except HttpError as e:
            if 'invalid_grant' in str(e) or 'Token has been expired or revoked' in str(e):
                # Clear credentials to force re-authentication
                user.gmail_sync_enabled = False
                db.commit()
                return {
                    "success": False,
                    "error": f"Authentication token expired or revoked. Please re-authenticate: {str(e)}"
                }
            else:
                return {
                    "success": False,
                    "error": f"Gmail API error: {str(e)}"
                }
        
        messages = results.get('messages', [])
        sync_count = 0
        
        for message in messages:
            # Check if email already exists
            existing_email = db.query(Email).filter(
                Email.user_id == user.id,
                Email.gmail_id == message['id']
            ).first()
            
            if existing_email:
                continue
                
            # Get full message details
            try:
                msg = service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='full'
                ).execute()
            except HttpError as e:
                # Log error but continue with other messages
                print(f"Error fetching message {message['id']}: {str(e)}")
                continue
            
            # Parse headers
            headers = msg['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
            to = next((h['value'] for h in headers if h['name'].lower() == 'to'), '')
            
            # Create new email record
            new_email = Email(
                user_id=user.id,
                gmail_id=msg['id'],
                thread_id=msg['threadId'],
                subject=subject,
                sender=sender,
                recipients=json.dumps([to]),  # Store as JSON array
                snippet=msg.get('snippet', ''),
                body_text=parse_email_body(msg['payload']),
                labels=json.dumps(msg.get('labelIds', [])),
                is_read='UNREAD' not in msg.get('labelIds', []),
                is_important='IMPORTANT' in msg.get('labelIds', []),
                created_at=datetime.utcnow().isoformat()  # Add created_at timestamp
            )
            
            db.add(new_email)
            sync_count += 1
        
        # Update last sync timestamp
        user.last_sync_timestamp = datetime.utcnow().isoformat()
        db.commit()
        
        return {
            "success": True,
            "emails_synced": sync_count,
            "total_messages": len(messages)
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e)
        } 