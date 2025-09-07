from fastapi import FastAPI, Depends, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import timedelta
from models import UserLogin, UserCreate
from auth_utils import create_access_token
from google_utils import verify_google_token
from constants import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from db import supabase
import json 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # frontend origin 
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
    if not db_user.get("pass") or not pwd_context.verify(user.password, db_user["pass"]):
        raise HTTPException(status_code=401, detail="Invalid information")
    
    if db_user.get("role") != user.role:
        raise HTTPException(status_code=401, detail="Invalid information")

    if db_user.get("role") != "citizen":
        if user.dept == "" or user.dept is None:
            raise HTTPException(status_code=401, detail="Invalid information")
        
        if user.dept != db_user.get("dept"):
            raise HTTPException(status_code=401, detail="Invalid information")
        

    token = create_access_token({"sub": db_user["email"], 
                                 "role": db_user['role']}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=False,  # Set to False for development, True for production
        samesite="Lax",
        max_age=60 * 60 * 24,
      
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
        .eq("state_name", user.state)
        .maybe_single()
        .execute()
    )

    
    if not state_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"State '{user.state}' not found in database"
        )

    state_id = state_result.data["id"]

    existing_user = supabase.table("users").select("email").eq("email", user.email).execute()
    if existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    hashed_pass = pwd_context.hash(user.passwrd)

    new_user_data = {
        "email": user.email,
        "first_name": user.fname,
        "last_name": user.lname,
        "pass": hashed_pass,
        "role": user.role,
        "state": state_id
    }

    supabase.table("users").insert(new_user_data).execute()

    return {"message": "User created successfully"}

    def get_issues(issues, title=None, state=None, city=None):

    filtered_issues = []
    for issue in issues:
        if title and issue.get('Title') != title:
            continue
        if state and issue.get('State') != state:
            continue
        if city and issue.get('City') != city:
            continue
        filtered_issues.append(issue)
    return filtered_issues

issues = [
    {"Title": "Road Repair", "State": "California", "City": "Los Angeles"},
    {"Title": "Water Leakage", "State": "California", "City": "San Francisco"},
    {"Title": "Road Repair", "State": "Nevada", "City": "Las Vegas"},
]

result = get_issues(issues, title="Road Repair", state="California")
print(result)
