from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, JSONResponse, HTMLResponse
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import json
import os
from app.database import get_db
from app.models import User, Todo
from app.auth import get_current_active_user

router = APIRouter(prefix="/google-calendar", tags=["Google Calendar"])

# Google OAuth2 configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

# Scopes required for Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def get_redirect_uri(request: Request) -> str:
    """Dynamically determine redirect URI based on request origin"""
    # Get the origin from the request headers
    origin = request.headers.get("origin") or request.headers.get("referer", "")
    
    if origin:
        # Extract base URL from origin/referer
        if origin.endswith("/"):
            origin = origin[:-1]
        # Remove any path from referer
        if "//" in origin:
            parts = origin.split("//")
            protocol = parts[0]
            domain = parts[1].split("/")[0]
            base_url = f"{protocol}//{domain}"
        else:
            base_url = origin
        
        # Check if it's a private IP (like 192.168.x.x, 10.x.x.x, etc.)
        # Google OAuth doesn't accept private IPs, so force localhost
        import re
        private_ip_pattern = r'(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)'
        if re.search(private_ip_pattern, base_url):
            base_url = "http://localhost:3000"
    else:
        # Fallback to localhost
        base_url = "http://localhost:3000"
    
    return f"{base_url}/google-calendar/callback"

def get_flow(redirect_uri: str):
    """Create OAuth2 flow with dynamic redirect URI"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
        )
    
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri]
        }
    }
    
    return Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=redirect_uri
    )

@router.get("/auth")
async def google_calendar_auth(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Initiate Google Calendar OAuth flow"""
    try:
        redirect_uri = get_redirect_uri(request)
        flow = get_flow(redirect_uri)
        # Encode user_id in the state parameter
        state_data = f"{current_user.id}"
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',  # Force consent to get refresh token
            state=state_data
        )
        
        return JSONResponse({
            "authorization_url": authorization_url,
            "state": state
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/callback")
async def google_calendar_callback(
    request: Request,
    code: str = None,
    state: str = None,
    error: str = None,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback"""
    if error:
        return HTMLResponse("""
        <html>
            <body>
                <script>window.close();</script>
                <p>Authorization failed. You can close this window.</p>
            </body>
        </html>
        """)
    
    if not code or not state:
        return HTMLResponse("""
        <html>
            <body>
                <script>window.close();</script>
                <p>Invalid request. You can close this window.</p>
            </body>
        </html>
        """)
    
    try:
        # Extract user_id from state
        user_id = int(state)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return HTMLResponse("""
            <html>
                <body>
                    <script>window.close();</script>
                    <p>User not found. You can close this window.</p>
                </body>
            </html>
            """)
        
        redirect_uri = get_redirect_uri(request)
        flow = get_flow(redirect_uri)
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        
        # Save token directly to database
        token_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        user.google_calendar_token = json.dumps(token_data)
        db.commit()
        
        # Close the popup with a simple script that notifies the opener
        return HTMLResponse("""
        <html>
            <head><title>Authorization Successful</title></head>
            <body>
                <script>
                    // Try multiple methods to communicate success
                    try {
                        if (window.opener && !window.opener.closed) {
                            window.opener.postMessage({type: 'GOOGLE_CALENDAR_SUCCESS'}, '*');
                        }
                    } catch(e) {}
                    
                    try {
                        localStorage.setItem('google_calendar_auth_status', 'success');
                        localStorage.setItem('google_calendar_auth_time', Date.now().toString());
                    } catch(e) {}
                    
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                </script>
                <h2>✓ Authorization Successful!</h2>
                <p>Your tasks are being synced to Google Calendar...</p>
                <p>This window will close automatically.</p>
            </body>
        </html>
        """)
    except Exception as e:
        error_msg = str(e).replace("'", "\\'")
        return HTMLResponse(f"""
        <html>
            <body>
                <script>
                    localStorage.setItem('google_calendar_auth_status', 'error');
                    localStorage.setItem('google_calendar_auth_error', '{error_msg}');
                    setTimeout(function() {{
                        window.close();
                    }}, 500);
                </script>
                <p>Authorization error: {str(e)}</p>
            </body>
        </html>
        """)

@router.post("/save-token")
async def save_google_token(
    token_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save Google OAuth token for current user"""
    try:
        current_user.google_calendar_token = json.dumps(token_data)
        db.commit()
        return {"message": "Token saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
async def sync_to_google_calendar(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sync all user tasks to Google Calendar"""
    if not current_user.google_calendar_token:
        raise HTTPException(
            status_code=400,
            detail="Google Calendar not connected. Please authenticate first."
        )
    
    try:
        # Parse stored credentials
        token_info = json.loads(current_user.google_calendar_token)
        credentials = Credentials(
            token=token_info.get('token'),
            refresh_token=token_info.get('refresh_token'),
            token_uri=token_info.get('token_uri'),
            client_id=token_info.get('client_id'),
            client_secret=token_info.get('client_secret'),
            scopes=token_info.get('scopes')
        )
        
        # Build Calendar service
        service = build('calendar', 'v3', credentials=credentials)
        
        # Get all user's todos
        todos = db.query(Todo).filter(Todo.owner_id == current_user.id).all()
        
        created_events = []
        errors = []
        
        for todo in todos:
            try:
                # Determine event time
                if todo.date:
                    # Use the date as-is but set a reasonable time if it's midnight
                    start_time = todo.date
                    # If time is midnight, set it to 9 AM instead
                    if start_time.hour == 0 and start_time.minute == 0:
                        start_time = start_time.replace(hour=9, minute=0)
                else:
                    # If no date set, schedule for tomorrow at 9 AM
                    from datetime import timezone
                    start_time = datetime.now(timezone.utc).replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
                
                # End time is 1 hour after start
                end_time = start_time + timedelta(hours=1)
                
                # Format times for Google Calendar
                # Remove timezone info and use local time
                start_dt = start_time.strftime('%Y-%m-%dT%H:%M:%S')
                end_dt = end_time.strftime('%Y-%m-%dT%H:%M:%S')
                
                # Create event
                event = {
                    'summary': todo.title,
                    'description': f"{todo.description or ''}\n\nPriority: {todo.priority}\nStatus: {todo.status}",
                    'start': {
                        'dateTime': start_dt,
                        'timeZone': 'Africa/Cairo',  # Your timezone (UTC+2)
                    },
                    'end': {
                        'dateTime': end_dt,
                        'timeZone': 'Africa/Cairo',
                    },
                    'reminders': {
                        'useDefault': False,
                        'overrides': [
                            {'method': 'popup', 'minutes': 30},
                        ],
                    },
                }
                
                # Add color based on priority
                if todo.priority == 'high':
                    event['colorId'] = '11'  # Red
                elif todo.priority == 'medium':
                    event['colorId'] = '5'   # Yellow
                else:
                    event['colorId'] = '2'   # Green
                
                # Insert event
                created_event = service.events().insert(calendarId='primary', body=event).execute()
                created_events.append({
                    'todo_id': todo.id,
                    'todo_title': todo.title,
                    'event_id': created_event.get('id'),
                    'event_link': created_event.get('htmlLink')
                })
                
            except Exception as e:
                errors.append({
                    'todo_id': todo.id,
                    'todo_title': todo.title,
                    'error': str(e)
                })
        
        # Update stored credentials if they were refreshed
        if credentials.token != token_info.get('token'):
            updated_token = {
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            }
            current_user.google_calendar_token = json.dumps(updated_token)
            db.commit()
        
        return {
            "message": f"Successfully synced {len(created_events)} tasks to Google Calendar",
            "created_events": created_events,
            "errors": errors,
            "total_tasks": len(todos),
            "successful": len(created_events),
            "failed": len(errors)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync: {str(e)}")

@router.get("/status")
async def get_calendar_status(
    current_user: User = Depends(get_current_active_user)
):
    """Check if Google Calendar is connected"""
    return {
        "connected": bool(current_user.google_calendar_token),
        "has_token": bool(current_user.google_calendar_token)
    }

@router.delete("/disconnect")
async def disconnect_google_calendar(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Disconnect Google Calendar"""
    current_user.google_calendar_token = None
    db.commit()
    return {"message": "Google Calendar disconnected successfully"}
