from fastapi import FastAPI, Depends, Request, Response, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import timedelta
from models import UserLogin, UserCreate, IssueReport, ProfileUpdate, StatusUpdate, SendOTPRequest, VerifyOTPRequest, ResetPasswordRequest, VoteRequest
from auth_utils import create_access_token
from google_utils import verify_google_token
from constants import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from db import supabase
import json 
import base64
from typing import Optional, List 
import httpx
import uuid
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def truncate_password_for_bcrypt(password: str) -> str:
    """
    Truncate password to 72 bytes for bcrypt compatibility.
    Bcrypt has a limitation of 72 bytes for passwords.
    """
    password_bytes = password.encode('utf-8')[:72]
    return password_bytes.decode('utf-8', errors='ignore')

COUNTRY_STATE_API_KEY = ""
PROD_ENV = os.getenv("PROD_ENV", False).lower() == "true"

# allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
# origin_list = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app = FastAPI()

# Add preflight CORS handler
@app.options("/{full_path:path}")
async def options_handler():
    return Response(
        content="",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Configure CORS for production and development
allowed_origins = [
    "http://localhost:3000",  # development frontend
    "https://janyachika.vercel.app",  # production frontend
    "https://*.vercel.app",  # any vercel app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "Cookie",
        "Set-Cookie",
        "X-Requested-With",
        "X-CSRFToken",
        "Origin",
        "Referer",
        "User-Agent"
    ],
    expose_headers=["Set-Cookie"],
    max_age=600,
)


@app.post("/login")
def login(user: UserLogin, response: Response):
    result = supabase.table("users").select("*").eq("email", user.email).execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid information")

    db_user = result.data[0]
    
    # Truncate password for bcrypt compatibility
    password_truncated = truncate_password_for_bcrypt(user.passwrd)
    
    if not db_user.get("pass") or not pwd_context.verify(password_truncated, db_user["pass"]):
        raise HTTPException(status_code=401, detail="Invalid information")
    
    if db_user.get("role") != user.role:
        raise HTTPException(status_code=401, detail="Invalid information")

    if db_user.get("role") != "citizen":
        if user.dept == 0 or user.dept is None:
            raise HTTPException(status_code=401, detail="Invalid information")
        
        if user.dept != db_user.get("dept"):
            raise HTTPException(status_code=401, detail="Invalid information")
        

    token = create_access_token({"sub": db_user["email"], 
                                 "role": db_user['role']}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    if PROD_ENV:
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=True,  # Set to False for development, True for production
            samesite="none",
            max_age=60 * 60 * 24,
            path="/"
        )
    else:
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=False,  # Set to False for development, True for production
            samesite="lax",
            max_age=60 * 60 * 24,
            path="/"
        )

    return {"message": "Logged in"}



@app.post("/login/google")
async def login_google(request: Request, response: Response):
    body = await request.json()
    google_token = body.get("token")
    if not google_token:
        raise HTTPException(status_code=400, detail="Missing Google token")

    user_info = verify_google_token(google_token)
    email = user_info["email"]

    result = supabase.table("users").select("*").eq("email", email).execute()
    user_exists = len(result.data) > 0

    if not user_exists:
        # Create user
        name = user_info.get("name").split(" ")
        supabase.table("users").insert({
            "email": email,
            "first_name": name[0],
            "last_name": name[-1] if len(name) > 1 else None,
            "dp": user_info.get("picture"),
            "pass": None
        }).execute()

    token = create_access_token({"sub": email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=False,  # Set to False for development, True for production
        samesite="Lax",
        max_age=60 * 60 * 24
    )
    return {"message": "Google login successful"}


def get_current_user(request: Request):
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/me")
def get_me(user: str = Depends(get_current_user)):
    return {"message": user}

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("auth_token")
    return {"message": "Logged out"}


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    state_result = (
        supabase.table("states")
        .select("id")
        .eq("id", user.state)
        .maybe_single()
        .execute()
    )

    if user.role != "citizen":
        dept_result = (
            supabase.table("departments")
            .select("id")
            .eq("id", user.dept)
            .maybe_single()
            .execute()
        )
        
        if not dept_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with id:'{user.dept}' not found in database"
            )
    
        dept_id = dept_result.data['id']

    
    if not state_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"State '{user.state}' not found in database"
        )
    

    state_id = state_result.data["id"]
    


    existing_user = supabase.table("users").select("email").eq("email", user.email).execute()
    if existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    print(user)
    
    # Truncate password for bcrypt compatibility
    password_truncated = truncate_password_for_bcrypt(user.passwrd)
    
    hashed_pass = pwd_context.hash(password_truncated)

    new_user_data = {
        "email": user.email,
        "first_name": user.fname,
        "last_name": user.lname,
        "pass": hashed_pass,
        "role": user.role,
        "state": state_id
    }

    if user.role != "citizen":
        new_user_data['dept'] = dept_id

    supabase.table("users").insert(new_user_data).execute()

    return {"message": "User created successfully"}



# ----------------------------------------------- Forgot Password / OTP Functionality --------------------------------------------------------

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def send_otp_email(email: str, otp: str):
    """Send OTP via email (configure with your email service)"""
    try:
        # Email configuration - You'll need to set these environment variables
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        sender_email = os.getenv("SENDER_EMAIL", "")
        sender_password = os.getenv("SENDER_PASSWORD", "")
        
        if not sender_email or not sender_password:
            print("Email configuration missing. OTP:", otp)
            return True  # For development, just log the OTP
        
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = "JanYachika - Password Reset OTP"
        
        # Email body
        body = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Your OTP for password reset is: <strong>{otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>JanYachika Team</p>
        </body>
        </html>
        """
        
        message.attach(MIMEText(body, "html"))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = message.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        print(f"Development OTP for {email}: {otp}")  # Log for development
        return False

@app.post("/send-otp")
def send_otp(request: SendOTPRequest):
    """
    Send OTP to user's email for password reset
    """
    try:
        # Check if user exists
        result = supabase.table("users").select("email, first_name").eq("email", request.email).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Email not found")
        
        user = result.data[0]
        
        # Generate OTP
        otp = generate_otp()
        otp_expiry = datetime.utcnow() + timedelta(minutes=10)  # expiry time - 10minutes
        
        otp_data = {
            "email": request.email,
            "otp": otp,
            "expires_at": otp_expiry.isoformat(),
            "used": False,
            "created_at": datetime.utcnow().isoformat()
        }
        

        existing_otp = supabase.table("otp_tokens").select("*").eq("email", request.email).eq("used", False).execute()
        
        if existing_otp.data:
            supabase.table("otp_tokens").update(otp_data).eq("email", request.email).eq("used", False).execute()
        else:
            supabase.table("otp_tokens").insert(otp_data).execute()
        
    
        email_sent = send_otp_email(request.email, otp)
        
        if email_sent:
            return {
                "message": "OTP sent successfully",
                "email": request.email,
                "expires_in": "10 minutes"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send OTP email")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in send_otp: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    """
    Verify the OTP sent to user's email
    """
    try:
        result = supabase.table("otp_tokens").select("*").eq("email", request.email).eq("otp", request.otp).eq("used", False).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        otp_record = result.data[0]
        
    
        expires_at = datetime.fromisoformat(otp_record["expires_at"])
        if datetime.utcnow() > expires_at:
            raise HTTPException(status_code=400, detail="OTP has expired")
        

        supabase.table("otp_tokens").update({"used": True, "used_at": datetime.utcnow().isoformat()}).eq("id", otp_record["id"]).execute()
        
        return {
            "message": "OTP verified successfully",
            "email": request.email,
            "verified": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in verify_otp: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    """
    Reset password using verified OTP
    """
    try:
        otp_result = supabase.table("otp_tokens").select("*").eq("email", request.email).eq("otp", request.otp).eq("used", True).execute()
        
        if not otp_result.data:
            raise HTTPException(status_code=400, detail="Invalid OTP or OTP not verified")
        
        otp_record = otp_result.data[0]
        
        if "used_at" in otp_record and otp_record["used_at"]:
            used_at = datetime.fromisoformat(otp_record["used_at"])
            now = datetime.now(timezone.utc)
            if now - used_at > timedelta(minutes=15):
                raise HTTPException(status_code=400, detail="OTP verification expired")
        
        
        # Truncate password for bcrypt compatibility
        password_truncated = truncate_password_for_bcrypt(request.new_password)
        
        hashed_password = pwd_context.hash(password_truncated)
        result = supabase.table("users").update({"pass": hashed_password}).eq("email", request.email).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        supabase.table("otp_tokens").update({"used": True, "used_at": datetime.utcnow().isoformat()}).eq("id", otp_record["id"]).execute()
        
        return {
            "message": "Password reset successfully",
            "email": request.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in reset_password: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ----------------------------------------------- Auth End --------------------------------------------------------
    
@app.get("/search-issues")
def get_issues(
    filter: Optional[str] = None,
    query: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """
    Get issues from Supabase with optional filtering
    """
    try:
        query_builder = supabase.table("issues").select("id,issue_title,issue_description,photos,latitude,longitude,downvotes,upvotes,issue_status,officer_id,reporter_email")
        
        if filter and query:
            query_builder = query_builder.eq(filter, query)
        # else:
        #     raise HTTPException(status_code=400, detail="Filter and query are required")

        result = query_builder.execute()
        for i in result.data:
            reporter_email = i.get("reporter_email")
            dp = supabase.table("users").select("dp").eq("email", reporter_email).execute()
            dp = dp.data[0]['dp']
            i['dp'] = dp
            
        photos = []
        for i in result.data:
            photos=[]
            for j in i['photos']:
                photos.append(json.loads(j)['url'])
            i['photos'] = photos
        
        return {"issues": result.data}
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error fetching issues: {str(e)}")



@app.post("/report-issue")
async def report_issue(
    title: str = Form(...),
    description: str = Form(...),
    state: int = Form(...),
    city: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    files: List[UploadFile] = File(None),
    user: dict = Depends(get_current_user)
):
    """
    Report a new issue with optional file attachments uploaded to Supabase storage
    """
    try:
        user_result = supabase.table("users").select("state").eq("email", user["sub"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_state_id = user_result.data[0]["state"]
 
 
        state_result = supabase.table("states").select("state_name").eq("id", state).execute()
        if not state_result.data:
            raise HTTPException(status_code=400, detail=f"State with id '{state}' not found")
        

        file_urls = []
        if files:
            for file in files:
                if file.filename: 
                    file_extension = os.path.splitext(file.filename)[1]
                    unique_filename = f"{uuid.uuid4()}{file_extension}"
                    
                    content = await file.read()
                    
                    try:
                        upload_result = supabase.storage.from_("uploads/issues").upload(
                            unique_filename, 
                            content,
                            file_options={"content-type": file.content_type or "application/octet-stream"}
                        )
                        
                        if upload_result:
                            file_url = supabase.storage.from_("uploads/issues").get_public_url(unique_filename)
                            file_urls.append({
                                "filename": file.filename,
                                "url": file_url,
                                "content_type": file.content_type
                            })
                    except Exception as upload_error:
                        print(f"Error uploading file {file.filename}: {str(upload_error)}")
                   
                        continue
        

        issue_data = {
            "issue_title": title,
            "issue_description": description,
            "state": user_state_id,
            "city": city,
            "reporter_email": user["sub"],
            "latitude": latitude,
            "longitude": longitude,
            "issue_status": "pending",
            "photos": file_urls if file_urls else None
        }
        
        result = supabase.table("issues").insert(issue_data).execute()
        
        return {"message": "Issue reported successfully", "issue_id": result.data[0]["id"], "uploaded_files": len(file_urls)}
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error reporting issue: {str(e)}")


@app.post("/vote-issue/{issue_id}")
def vote_issue(
    issue_id: int,
    vote_request: VoteRequest,
    user: dict = Depends(get_current_user)
):
    """
    Vote on an issue (upvote or downvote)
    """
    try:
        vote_type = vote_request.vote_type
        if vote_type not in ["upvote", "downvote"]:
            raise HTTPException(status_code=400, detail="Invalid vote type. Must be 'upvote' or 'downvote'")
        
        # Check if the issue exists
        issue_result = supabase.table("issues").select("id,upvotes,downvotes").eq("id", issue_id).execute()
        if not issue_result.data:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        issue = issue_result.data[0]
        current_upvotes = issue.get("upvotes", 0)
        current_downvotes = issue.get("downvotes", 0)
        
        # Check if user has already voted on this issue
        existing_vote = supabase.table("issue_votes").select("*").eq("issue_id", issue_id).eq("user_email", user["sub"]).execute()
        
        if existing_vote.data:
            # User has already voted, update the vote
            existing_vote_data = existing_vote.data[0]
            old_vote_type = existing_vote_data["vote_type"]
            
            if old_vote_type == vote_type:
                # Same vote type, remove the vote (toggle off)
                supabase.table("issue_votes").delete().eq("id", existing_vote_data["id"]).execute()
                
                # Decrease the count
                if vote_type == "upvote":
                    new_upvotes = max(0, current_upvotes - 1)
                    supabase.table("issues").update({"upvotes": new_upvotes}).eq("id", issue_id).execute()
                else:
                    new_downvotes = max(0, current_downvotes - 1)
                    supabase.table("issues").update({"downvotes": new_downvotes}).eq("id", issue_id).execute()
                    
                return {
                    "message": f"{vote_type.capitalize()} removed",
                    "vote_type": None,
                    "upvotes": new_upvotes if vote_type == "upvote" else current_upvotes,
                    "downvotes": new_downvotes if vote_type == "downvote" else current_downvotes
                }
            else:
                # Different vote type, update the vote
                supabase.table("issue_votes").update({
                    "vote_type": vote_type,
                    "created_at": datetime.utcnow().isoformat()
                }).eq("id", existing_vote_data["id"]).execute()
                
                # Update counts (decrease old type, increase new type)
                if old_vote_type == "upvote":
                    new_upvotes = max(0, current_upvotes - 1)
                    new_downvotes = current_downvotes + 1
                else:
                    new_upvotes = current_upvotes + 1
                    new_downvotes = max(0, current_downvotes - 1)
                
                supabase.table("issues").update({
                    "upvotes": new_upvotes,
                    "downvotes": new_downvotes
                }).eq("id", issue_id).execute()
                
                return {
                    "message": f"Vote changed to {vote_type}",
                    "vote_type": vote_type,
                    "upvotes": new_upvotes,
                    "downvotes": new_downvotes
                }
        else:
            # User hasn't voted yet, create new vote
            supabase.table("issue_votes").insert({
                "issue_id": issue_id,
                "user_email": user["sub"],
                "vote_type": vote_type,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
            # Increase the count
            if vote_type == "upvote":
                new_upvotes = current_upvotes + 1
                supabase.table("issues").update({"upvotes": new_upvotes}).eq("id", issue_id).execute()
                return {
                    "message": "Upvoted successfully",
                    "vote_type": vote_type,
                    "upvotes": new_upvotes,
                    "downvotes": current_downvotes
                }
            else:
                new_downvotes = current_downvotes + 1
                supabase.table("issues").update({"downvotes": new_downvotes}).eq("id", issue_id).execute()
                return {
                    "message": "Downvoted successfully",
                    "vote_type": vote_type,
                    "upvotes": current_upvotes,
                    "downvotes": new_downvotes
                }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error voting on issue: {e}")
        raise HTTPException(status_code=500, detail=f"Error voting on issue: {str(e)}")


@app.get("/issue-vote-status/{issue_id}")
def get_issue_vote_status(
    issue_id: int,
    user: dict = Depends(get_current_user)
):
    """
    Get the current user's vote status for an issue
    """
    try:
        # Check if user has voted on this issue
        vote_result = supabase.table("issue_votes").select("vote_type").eq("issue_id", issue_id).eq("user_email", user["sub"]).execute()
        
        if vote_result.data:
            return {
                "has_voted": True,
                "vote_type": vote_result.data[0]["vote_type"]
            }
        else:
            return {
                "has_voted": False,
                "vote_type": None
            }
    
    except Exception as e:
        print(f"Error getting vote status: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting vote status: {str(e)}")





@app.get("/api/profile")
def get_profile(
    user: dict = Depends(get_current_user)
):
    """
    Get user profile information using cookie-based authentication
    """
    try:
        result = supabase.table("users").select("*").eq("email", user["sub"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = result.data[0]
        
        # Transform the data to match frontend expectations
        profile_data = {
            "first_name": user_data.get("first_name"),
            "last_name": user_data.get("last_name"),
            "email": user_data.get("email"),
            "phone": user_data.get("phone"),
            "bio": user_data.get("bio"),
            "location": user_data.get("address"),  # mapping address to location
            "dp": user_data.get("dp"),
            "created_at": user_data.get("created_at"),
            "role": user_data.get("role"),
            "state": user_data.get("state"),
            "dept": user_data.get("dept")
        }
        
        return {"message": "Profile retrieved successfully", "data": [profile_data]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving profile: {str(e)}")

@app.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    Upload profile picture to Supabase storage and update user dp field
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Validate file size (limit to 5MB)
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
        unique_filename = f"profile_pictures/{user['sub']}/{uuid.uuid4()}{file_extension}"
        
        # Get current profile picture to delete it later (optional cleanup)
        current_user_result = supabase.table("users").select("dp").eq("email", user["sub"]).execute()
        old_dp_url = current_user_result.data[0].get("dp") if current_user_result.data else None
        
        # Upload to Supabase storage
        upload_result = supabase.storage.from_("uploads").upload(
            unique_filename,
            content,
            file_options={"content-type": file.content_type}
        )
        
        if upload_result:
            # Get public URL
            file_url = supabase.storage.from_("uploads").get_public_url(unique_filename)
            
            # Update user's dp field in database
            result = supabase.table("users").update({"dp": file_url}).eq("email", user["sub"]).execute()
            
            if not result.data:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Optional: Clean up old profile picture (silently ignore errors)
            if old_dp_url and "uploads" in old_dp_url:
                try:
                    # Extract filename from old URL for deletion
                    old_filename = old_dp_url.split("/uploads/")[-1]
                    supabase.storage.from_("uploads").remove([old_filename])
                except Exception as cleanup_error:
                    print(f"Warning: Could not delete old profile picture: {cleanup_error}")
            
            return {
                "message": "Profile picture updated successfully",
                "dp_url": file_url
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to upload file")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading profile picture: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading profile picture: {str(e)}")

@app.post("/api/profile/update")
def update_profile_api(
    profile_data: ProfileUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update user profile information via API endpoint using cookie-based authentication
    """
    try:
        update_data = {}
        if profile_data.first_name is not None:
            update_data["first_name"] = profile_data.first_name
        if profile_data.last_name is not None:
            update_data["last_name"] = profile_data.last_name
        if profile_data.phone is not None:
            update_data["phone"] = profile_data.phone
        if profile_data.address is not None:
            update_data["address"] = profile_data.address
        if profile_data.dp is not None:
            update_data["dp"] = profile_data.dp
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = supabase.table("users").update(update_data).eq("email", user["sub"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Profile updated successfully", "user": result.data[0]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.put("/update-profile")
def update_profile(
    profile_data: ProfileUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update user profile information
    """
    try:

        update_data = {}
        if profile_data.first_name is not None:
            update_data["first_name"] = profile_data.first_name
        if profile_data.last_name is not None:
            update_data["last_name"] = profile_data.last_name
        if profile_data.phone is not None:
            update_data["phone"] = profile_data.phone
        if profile_data.address is not None:
            update_data["address"] = profile_data.address
        if profile_data.dp is not None:
            update_data["dp"] = profile_data.dp
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = supabase.table("users").update(update_data).eq("email", user["sub"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Profile updated successfully", "user": result.data[0]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.put("/update-status")
def update_status(
    status_data: StatusUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update the status of an issue
    """
    try:
        user_result = supabase.table("users").select("role").eq("email", user["sub"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_role = user_result.data[0]["role"]
        if user_role not in ["official", "admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to update status")

        update_data = {"status": status_data.status}
        if status_data.notes:
            update_data["notes"] = status_data.notes

        result = supabase.table("issues").update(update_data).eq("id", status_data.issue_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        return {"message": "Status updated successfully", "issue": result.data[0]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

@app.get("/get-officers")
def get_officers(user: dict = Depends(get_current_user)):
    """
    Get all officers - only accessible by admin users
    """
    try:
        # Check if user is admin
        user_result = supabase.table("users").select("role").eq("email", user["sub"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_role = user_result.data[0]["role"]
        if user_role != "admin":
            raise HTTPException(status_code=403, detail="Insufficient permissions. Admin access required.")
        
        # Get all users with role 'officer'
        result = supabase.table("users").select("*").eq("role", "officer").execute() 
        officers = []
        dic = {}
        for i in result.data:
            dic["id"] = i['id']
            dic["first_name"] = i['first_name']
            dic["email"] = i['email']
            dic["dept"] = i['dept']
            officers.append(dic)
        
        print(officers)
        return {"officers": officers}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching officers: {str(e)}")



# GET https://api.countrystatecity.in/v1/countries/IN/states
# For state_codes 

# async def get_cities(state_code: str):
#     country_code = "IN"  # India
#     url = f"https://api.countrystatecity.in/v1/countries/{country_code}/states/{state_code}/cities"
#     headers = {"X-CSCAPI-KEY": COUNTRY_STATE_API_KEY}

#     async with httpx.AsyncClient() as client:
#         response = await client.get(url, headers=headers)

#     if response.status_code == 200:
#         cities = response.json()
#         return [city["name"] for city in cities]
#     elif response.status_code == 401:
#         raise HTTPException(status_code=401, detail="Unauthorized. Invalid API key.")
#     elif response.status_code == 404:
#         raise HTTPException(status_code=404, detail="State not found.")
#     else:
#         raise HTTPException(status_code=500, detail="An error occurred while fetching cities.")


@app.get("/get_cities")
def get_cities(state_code: str):
    try:
        # Construct the file path based on state code
        file_path = f'cities/{state_code.upper()}.json'
        
        with open(file_path, 'r', encoding='utf-8') as f:
            cities_data = json.load(f)
        
        # cities_data is an array of city objects with id, name, latitude, longitude
        return {"cities": cities_data}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Cities not found for state code: {state_code}")
    except Exception as e:
        print(f"Error reading cities file: {e}")
        raise HTTPException(status_code=500, detail="Error loading cities")

@app.get("/fetch_states_and_dept")
def get_states():
    try:
        states = (
            supabase
            .table("states")
            .select("id, state_name, state_code")
            .order("state_name")
            .execute()
        )

        depts = (
            supabase
            .table("departments")
            .select("id, dep_name")
            .order("dep_name")
            .execute()
        )

        if not states:
            raise HTTPException(status_code = 404, detail="States not found")

        if not depts:
            raise HTTPException(status_code = 404, detail="Departments not found")
        
        return {"states": states, "depts": depts}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error while fetching states!")

@app.get("/map-view")
def get_map_view_data(
    user: dict = Depends(get_current_user)
):
    """
    Get all issue coordinates for heatmap visualization
    Returns coordinates in the format expected by the HeatMap component: [[lat, lng, intensity]]
    """
    try:
        # Fetch all non-resolved issues with coordinates and basic info for intensity calculation
        result = supabase.table("issues").select(
            "id, latitude, longitude, upvotes, downvotes, issue_status, issue_title, issue_description, city"
        ).neq("issue_status", "resolved").execute()
        
        if not result.data:
            return {"coordinates": [], "message": "No issues found"}
        
        coordinates = []
        
        for issue in result.data:
            try:
                # Parse latitude and longitude (they might be stored as strings)
                lat = float(issue["latitude"]) if issue["latitude"] else None
                lng = float(issue["longitude"]) if issue["longitude"] else None
                
                # Skip issues without valid coordinates
                if lat is None or lng is None:
                    continue
                    
                # Calculate intensity based on votes and status
                upvotes = issue.get("upvotes", 0) or 0
                downvotes = issue.get("downvotes", 0) or 0
                total_votes = upvotes + downvotes
                
                # Enhanced base intensity calculation for better visibility
                # Higher base intensity to ensure visibility at all zoom levels
                if total_votes > 0:
                    vote_ratio = upvotes / total_votes if total_votes > 0 else 0.5
                    # Base intensity of 0.6, increased by vote ratio
                    intensity = 0.1 + (vote_ratio * 0.4)  # Range: 0.6 to 1.0
                else:
                    intensity = 0.1  # Higher default intensity for issues with no votes
                
                # Adjust intensity based on status with more pronounced differences
                status = issue.get("issue_status", "").lower()
                if status == "in_progress":
                    intensity = min(1.0, intensity * 1.1)  # Slight increase for in-progress
                elif status in ["urgent", "high_priority"]:
                    intensity = min(1.0, intensity * 1.3)  # Significant increase for urgent
                elif status == "pending":
                    intensity = min(1.0, intensity * 1.2)  # Increase for pending issues
                
                # Apply vote-based boost for high engagement
                if total_votes >= 5:  # Issues with significant engagement
                    intensity = min(1.0, intensity * 1.2)
                elif total_votes >= 10:
                    intensity = min(1.0, intensity * 1.4)
                
                # Ensure intensity is within valid range with higher minimum for visibility
                intensity = max(0.4, min(1.0, intensity))  # Increased minimum from 0.1 to 0.4
                
                # Add to coordinates array in format [lat, lng, intensity]
                coordinates.append([lat, lng, intensity])
                
            except (ValueError, TypeError) as e:
                # Skip issues with invalid coordinate data
                print(f"Skipping issue {issue.get('id')} due to invalid coordinates: {e}")
                continue
        
        # Also include some metadata for the frontend
        metadata = {
            "total_issues": len(result.data),
            "issues_with_coordinates": len(coordinates),
            "center": None  # Will be calculated on frontend or use user's location
        }
        
        # Calculate a reasonable center point if we have coordinates
        if coordinates:
            avg_lat = sum(coord[0] for coord in coordinates) / len(coordinates)
            avg_lng = sum(coord[1] for coord in coordinates) / len(coordinates)
            metadata["center"] = [avg_lat, avg_lng]
        
        return {
            "coordinates": coordinates,
            "metadata": metadata,
            "message": f"Successfully retrieved {len(coordinates)} issues with coordinates"
        }
        
    except Exception as e:
        print(f"Error in get_map_view_data: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching map data: {str(e)}")


