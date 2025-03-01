import httpx
from app.core.config import settings
from typing import Dict, Any, List, Optional
import json

DEEPSEEK_API_BASE = settings.DEEPSEEK_API_BASE
DEEPSEEK_API_KEY = settings.DEEPSEEK_API_KEY

async def analyze_email(subject: str, body: str, sender: str) -> Dict[str, Any]:
    """
    Analyze email content using DeepSeek LLM to extract:
    - Category
    - Priority
    - Sentiment
    - Summary
    - Action Items
    """
    prompt = f"""Analyze this email and provide structured information in JSON format. Your response should be ONLY valid JSON, no other text.

Email Subject: {subject}
From: {sender}
Content: {body[:1000]}

Required JSON format:
{{
    "category": "Work|Personal|Newsletter|Promotional|Social|Other",
    "priority_score": "1-5 number",
    "sentiment": "Positive|Negative|Neutral",
    "summary": "1-2 sentence summary",
    "action_items": ["list", "of", "actions"],
    "tone": "Formal|Casual|Professional|Urgent"
}}"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DEEPSEEK_API_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {
                            "role": "system", 
                            "content": "You are an AI assistant that analyzes emails and provides structured information in JSON format. Always respond with valid JSON only, no other text."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3  # Lower temperature for more consistent results
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content'].strip()
                
                # Try to clean the response if it's not pure JSON
                try:
                    # Remove any markdown code block markers if present
                    if content.startswith('```json'):
                        content = content[7:]
                    if content.startswith('```'):
                        content = content[3:]
                    if content.endswith('```'):
                        content = content[:-3]
                    
                    # Strip whitespace and try to parse
                    content = content.strip()
                    analysis = json.loads(content)
                    
                    # Validate required fields
                    required_fields = ['category', 'priority_score', 'sentiment', 'summary', 'action_items', 'tone']
                    if all(field in analysis for field in required_fields):
                        return {
                            "success": True,
                            "analysis": analysis
                        }
                    else:
                        return {
                            "success": False,
                            "error": "Missing required fields in LLM response"
                        }
                        
                except json.JSONDecodeError as e:
                    return {
                        "success": False,
                        "error": f"Failed to parse LLM response as JSON: {str(e)}\nResponse: {content}"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API request failed with status {response.status_code}"
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

async def generate_email_draft(email: Any, mode: str, instructions: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate an email draft using DeepSeek LLM
    
    Args:
        email: The original email object
        mode: 'reply' or 'forward'
        instructions: Optional instructions for customizing the draft
    
    Returns:
        Dictionary with success status and draft text or error
    """
    # Extract email details
    subject = email.subject
    sender = email.sender
    body = email.body_text or email.snippet or ""
    
    # Get email analysis if available
    category = email.category or "Unknown"
    priority = email.priority_score or 3
    action_items = []
    
    # Parse action items if available
    if email.action_items:
        try:
            if isinstance(email.action_items, str):
                action_items = json.loads(email.action_items)
            else:
                action_items = email.action_items
        except:
            action_items = []
    
    # Build the prompt
    system_prompt = """You are an AI assistant that helps users draft professional and contextually appropriate email responses.
Your task is to generate a complete email draft that is ready to send with minimal editing.
Analyze the original email carefully and create a response that addresses all key points and action items.
The tone should match the context (formal for business, friendly for personal, etc.).
Include appropriate greetings and sign-offs.
"""

    # Create the user prompt based on mode and instructions
    if mode == "reply":
        user_prompt = f"""Generate a complete email reply to the following message.

ORIGINAL EMAIL:
Subject: {subject}
From: {sender}
Category: {category}
Priority: {priority}/5
Content: {body[:1500]}

"""
        if action_items and len(action_items) > 0:
            user_prompt += "Action Items Identified:\n"
            for item in action_items:
                user_prompt += f"- {item}\n"
            user_prompt += "\n"
        
        if instructions:
            user_prompt += f"SPECIAL INSTRUCTIONS: {instructions}\n\n"
        
        user_prompt += """Generate a complete email reply that:
1. Uses an appropriate greeting
2. Addresses all key points from the original email
3. Responds to any questions or requests
4. Acknowledges and addresses all action items
5. Uses a professional and appropriate tone
6. Includes a proper sign-off

COMPLETE EMAIL REPLY:"""

    else:  # forward
        user_prompt = f"""Generate a message to accompany a forwarded email.

FORWARDED EMAIL:
Subject: {subject}
From: {sender}
Category: {category}
Priority: {priority}/5
Content: {body[:1500]}

"""
        if instructions:
            user_prompt += f"SPECIAL INSTRUCTIONS: {instructions}\n\n"
        
        user_prompt += """Generate a brief message explaining why you're forwarding this email. The message should:
1. Be concise but informative
2. Explain why the recipient should care about this forwarded email
3. Highlight any important points or action items
4. Include a proper sign-off

FORWARDING MESSAGE:"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DEEPSEEK_API_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7,  # Higher temperature for more creative responses
                    "max_tokens": 1000
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                draft = result['choices'][0]['message']['content'].strip()
                
                return {
                    "success": True,
                    "draft": draft
                }
            else:
                return {
                    "success": False,
                    "error": f"API request failed with status {response.status_code}"
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        } 