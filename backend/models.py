from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    hashed_password: str  # For local auth only

class UserInDB(User):
    pass

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    state: str
    dept: str
    role: str


class UserCreate(BaseModel):
    email: EmailStr
    fname: str
    lname: str
    dept: str
    passwrd: str
    role: str
    state: str