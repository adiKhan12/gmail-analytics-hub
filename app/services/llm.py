import httpx
from app.core.config import settings
from typing import Dict, Any, List
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