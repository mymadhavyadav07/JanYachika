from fastapi import FastAPI, Depends, Request, Response, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import timedelta
from models import UserLogin, UserCreate, IssueReport, ProfileUpdate, StatusUpdate
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


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

COUNTRY_STATE_API_KEY = ""
PROD_ENV = False

allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
origin_list = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]
print(f"CORS allowed origins: {origin_list}")  # DEBUG LOG

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://janyachika.vercel.app/login"], # frontend origin 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/login")
def login(user: UserLogin, response: Response):
    result = supabase.table("users").select("*").eq("email", user.email).execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid information")

    db_user = result.data[0]
    if not db_user.get("pass") or not pwd_context.verify(user.passwrd, db_user["pass"]):
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
    hashed_pass = pwd_context.hash(user.passwrd)

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
        query_builder = supabase.table("issues").select("id,issue_title,issue_description,photos,latitude,longitude,downvotes,upvotes,issue_status,officer_id")
        
        if filter and query:
            query_builder = query_builder.eq(filter, query)
        # else:
        #     raise HTTPException(status_code=400, detail="Filter and query are required")

        result = query_builder.execute()
        photos = []
        for i in result.data:
            photos=[]
            for j in i['photos']:
                photos.append(json.loads(j)['url'])
            i['photos'] = photos
        
        return {"issues": result.data}
    
    except Exception as e:
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
async def get_cities(state_code: str):
    country_code = "IN"  # India
    url = f"https://api.countrystatecity.in/v1/countries/{country_code}/states/{state_code}/cities"
    headers = {"X-CSCAPI-KEY": COUNTRY_STATE_API_KEY}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code == 200:
        cities = response.json()
        return [city["name"] for city in cities]
    elif response.status_code == 401:
        raise HTTPException(status_code=401, detail="Unauthorized. Invalid API key.")
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail="State not found.")
    else:
        raise HTTPException(status_code=500, detail="An error occurred while fetching cities.")


@app.get("/fetch_states_and_dept")
def get_states():
    try:
        states = (
            supabase
            .table("states")
            .select("id, state_name")
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


