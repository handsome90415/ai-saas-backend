import firebase_admin
from firebase_admin import credentials, auth
from config import FIREBASE_CREDENTIALS_PATH
import json
import os

_initialized = False


def init_firebase():
    global _initialized
    if _initialized:
        return
    if FIREBASE_CREDENTIALS_PATH and os.path.exists(FIREBASE_CREDENTIALS_PATH):
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        _initialized = True
    elif os.path.exists("firebase-service-account.json"):
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)
        _initialized = True


def verify_firebase_token(id_token: str) -> dict:
    init_firebase()
    decoded = auth.verify_id_token(id_token)
    return {
        "uid": decoded.get("uid"),
        "email": decoded.get("email"),
        "name": decoded.get("name"),
        "email_verified": decoded.get("email_verified", False),
    }
