from pydantic import BaseModel, EmailStr
from typing import Optional, List
from fastapi import File, UploadFile

class User(BaseModel):
    email: EmailStr
    hashed_password: str  # For local auth only

class UserInDB(User):
    pass

class UserLogin(BaseModel):
    email: EmailStr
    passwrd: str
    state: int
    dept: int
    role: str


class UserCreate(BaseModel):
    email: EmailStr
    fname: str
    lname: str
    dept: int
    passwrd: str
    role: str
    state: int

class IssueReport(BaseModel):
    title: str
    description: str
    state: int
    city: str
    

    # category: str
    # priority: str
    # latitude: Optional[float] = None
    # longitude: Optional[float] = None

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    dp: Optional[str] = None

class StatusUpdate(BaseModel):
    issue_id: int
    status: str
    notes: Optional[str] = None