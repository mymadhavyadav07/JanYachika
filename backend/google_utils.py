# google_utils.py
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request())
        return {
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")
