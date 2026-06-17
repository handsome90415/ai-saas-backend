from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, User
from auth import create_access_token

router = APIRouter()


class FirebaseLoginRequest(BaseModel):
    id_token: str
    email: Optional[str] = None
    name: Optional[str] = None


class OAuthResponse(BaseModel):
    user: dict
    access_token: str


@router.post("/api/auth/firebase-login", response_model=OAuthResponse)
async def firebase_login(req: FirebaseLoginRequest, db: AsyncSession = Depends(get_db)):
    fb_user = None
    try:
        from firebase_admin_app import verify_firebase_token
        fb_user = verify_firebase_token(req.id_token)
    except Exception:
        pass

    email = (fb_user.get("email") if fb_user else None) or req.email
    name = (fb_user.get("name") if fb_user else None) or req.name or ""

    if not email:
        raise HTTPException(status_code=400, detail="無法取得 Email")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            name=name,
            hashed_password="firebase",
            plan="free",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        if name and not user.name:
            user.name = name
            await db.commit()
            await db.refresh(user)

    token = create_access_token(user.id)
    return OAuthResponse(
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan": user.plan,
            "has_api_key": bool(user.openai_api_key),
            "has_gemini_key": bool(getattr(user, 'gemini_api_key', None)),
            "has_claude_key": bool(getattr(user, 'claude_api_key', None)),
            "preferred_provider": getattr(user, 'preferred_provider', 'openai'),
            "openai_model": getattr(user, 'openai_model', 'gpt-4o-mini'),
            "gemini_model": getattr(user, 'gemini_model', 'gemini-1.5-flash'),
            "claude_model": getattr(user, 'claude_model', 'claude-3-haiku-20240307'),
        },
        access_token=token,
    )


class GoogleLoginRequest(BaseModel):
    credential: str


class AppleLoginRequest(BaseModel):
    identity_token: str
    user_name: Optional[str] = None


@router.post("/api/auth/google", response_model=OAuthResponse)
async def google_login(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": req.credential}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Google 驗證失敗")

            google_user = response.json()
            email = google_user.get("email")
            name = google_user.get("name", "")

            if not email:
                raise HTTPException(status_code=400, detail="無法取得 Email")

            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user:
                user = User(
                    email=email,
                    name=name,
                    hashed_password="oauth",
                    plan="free",
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)

            token = create_access_token(user.id)
            return OAuthResponse(
                user={
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "plan": user.plan,
                    "has_api_key": bool(user.openai_api_key),
                    "has_gemini_key": bool(getattr(user, 'gemini_api_key', None)),
                    "has_claude_key": bool(getattr(user, 'claude_api_key', None)),
                    "preferred_provider": getattr(user, 'preferred_provider', 'openai'),
                    "openai_model": getattr(user, 'openai_model', 'gpt-4o-mini'),
                    "gemini_model": getattr(user, 'gemini_model', 'gemini-1.5-flash'),
                    "claude_model": getattr(user, 'claude_model', 'claude-3-haiku-20240307'),
                },
                access_token=token,
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/auth/apple", response_model=OAuthResponse)
async def apple_login(req: AppleLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        import jwt

        try:
            payload = jwt.decode(req.identity_token, options={"verify_signature": False})
            email = payload.get("email")
            name = req.user_name or payload.get("name", "")

            if not email:
                raise HTTPException(status_code=400, detail="無法取得 Email")

            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user:
                user = User(
                    email=email,
                    name=name,
                    hashed_password="oauth",
                    plan="free",
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)

            token = create_access_token(user.id)
            return OAuthResponse(
                user={
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "plan": user.plan,
                    "has_api_key": bool(user.openai_api_key),
                    "has_gemini_key": bool(getattr(user, 'gemini_api_key', None)),
                    "has_claude_key": bool(getattr(user, 'claude_api_key', None)),
                    "preferred_provider": getattr(user, 'preferred_provider', 'openai'),
                    "openai_model": getattr(user, 'openai_model', 'gpt-4o-mini'),
                    "gemini_model": getattr(user, 'gemini_model', 'gemini-1.5-flash'),
                    "claude_model": getattr(user, 'claude_model', 'claude-3-haiku-20240307'),
                },
                access_token=token,
            )
        except Exception:
            raise HTTPException(status_code=401, detail="Apple 驗證失敗")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
