from fastapi import FastAPI, HTTPException, Depends, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from typing import Optional
import json
from openai import OpenAI
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager

from database import init_db, get_db, User, Generation, UsageRecord
from auth import hash_password, verify_password, create_access_token, get_current_user
from config import OPENAI_API_KEY
from app.routers import product
from app.routers import oauth
from app.routers import admin


def get_user_openai_client(api_key: str) -> OpenAI:
    return OpenAI(api_key=api_key)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="AI Content Generator API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product.router)
app.include_router(oauth.router)
app.include_router(admin.router)

openai_client = OpenAI(api_key=OPENAI_API_KEY)


# ── Auth ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    plan: str
    has_api_key: bool = False

class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str


@app.post("/api/auth/register", response_model=AuthResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="此 Email 已被註冊")

    user = User(email=req.email, hashed_password=hash_password(req.password), name=req.name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(user.id)
    return AuthResponse(user=UserResponse(**user.__dict__, has_api_key=bool(user.openai_api_key)), access_token=token)


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email 或密碼錯誤")
    token = create_access_token(user.id)
    return AuthResponse(user=UserResponse(**user.__dict__, has_api_key=bool(user.openai_api_key)), access_token=token)


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse(**user.__dict__, has_api_key=bool(user.openai_api_key))


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UpdateApiKeyRequest(BaseModel):
    api_key: str


@app.put("/api/auth/profile", response_model=UserResponse)
async def update_profile(
    req: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.name is not None:
        user.name = req.name
        await db.commit()
        await db.refresh(user)
    return UserResponse(**user.__dict__, has_api_key=bool(user.openai_api_key))


@app.put("/api/auth/password")
async def change_password(
    req: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="目前密碼錯誤")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="新密碼至少需要 6 個字元")
    user.hashed_password = hash_password(req.new_password)
    await db.commit()
    return {"success": True, "message": "密碼已更新"}


@app.put("/api/auth/api-key", response_model=UserResponse)
async def update_api_key(
    req: UpdateApiKeyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not req.api_key.startswith("sk-"):
        raise HTTPException(status_code=400, detail="無效的 API Key 格式")
    user.openai_api_key = req.api_key
    await db.commit()
    await db.refresh(user)
    return UserResponse(**user.__dict__, has_api_key=bool(user.openai_api_key))


@app.delete("/api/auth/api-key")
async def delete_api_key(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.openai_api_key = None
    await db.commit()
    return {"success": True, "message": "API Key 已刪除"}


# ── Generation ────────────────────────────────────────

class TextGenerationRequest(BaseModel):
    prompt: str
    style: Optional[str] = "professional"
    platform: Optional[str] = "general"
    length: Optional[str] = "medium"

class ImageGenerationRequest(BaseModel):
    prompt: str
    style: Optional[str] = "realistic"
    size: Optional[str] = "1024x1024"

class TextGenerationResponse(BaseModel):
    content: str
    title: str
    hashtags: list[str]

class ImageGenerationResponse(BaseModel):
    image_url: str
    revised_prompt: str


@app.get("/")
async def root():
    return {"message": "AI Content Generator API", "version": "1.0.0"}


@app.post("/api/generate/text", response_model=TextGenerationResponse)
async def generate_text(
    request: TextGenerationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.openai_api_key:
        raise HTTPException(status_code=400, detail="請先在設定中新增 OpenAI API Key")
    try:
        openai_client = get_user_openai_client(user.openai_api_key)
        style_prompts = {
            "professional": "專業、正式的商業語氣",
            "casual": "輕鬆、友善的口語風格",
            "creative": "有創意、吸睛的行銷文案",
            "educational": "教學、知識分享的語氣",
        }
        platform_context = {
            "instagram": "Instagram 貼文，需要吸引人的標題和hashtag",
            "facebook": "Facebook 貼文，適合長文分享",
            "twitter": "Twitter/X 貼文，簡潔有力",
            "linkedin": "LinkedIn 專業文章",
            "blog": "部落格文章，SEO 友善",
            "general": "通用社群內容",
        }
        system_prompt = f"""你是一個專業的內容創作者。
語氣風格: {style_prompts.get(request.style, style_prompts['professional'])}
平台: {platform_context.get(request.platform, platform_context['general'])}

請根據用戶的需求生成內容，並以 JSON 格式回傳:
{{
  "title": "吸睛標題",
  "content": "主要內容",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}}

內容長度: {request.length}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.prompt},
            ],
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)

        gen = Generation(user_id=user.id, type="text", prompt=request.prompt, result=json.dumps(result, ensure_ascii=False))
        db.add(gen)
        db.add(UsageRecord(user_id=user.id, type="text"))
        await db.commit()

        return TextGenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate/image", response_model=ImageGenerationResponse)
async def generate_image(
    request: ImageGenerationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.openai_api_key:
        raise HTTPException(status_code=400, detail="請先在設定中新增 OpenAI API Key")
    try:
        openai_client = get_user_openai_client(user.openai_api_key)
        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=request.prompt,
            size=request.size,
            quality="standard",
            n=1,
        )
        result = {
            "image_url": response.data[0].url,
            "revised_prompt": response.data[0].revised_prompt,
        }

        gen = Generation(user_id=user.id, type="image", prompt=request.prompt, result=json.dumps(result, ensure_ascii=False))
        db.add(gen)
        db.add(UsageRecord(user_id=user.id, type="image"))
        await db.commit()

        return ImageGenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate/product-image")
async def generate_product_image(
    request: ImageGenerationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.openai_api_key:
        raise HTTPException(status_code=400, detail="請先在設定中新增 OpenAI API Key")
    try:
        openai_client = get_user_openai_client(user.openai_api_key)
        enhanced_prompt = f"""Professional e-commerce product photo:
        {request.prompt}
        Style: Clean, white background, studio lighting, high quality product photography"""

        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size="1024x1024",
            quality="hd",
            n=1,
        )
        result = {
            "image_url": response.data[0].url,
            "revised_prompt": response.data[0].revised_prompt,
        }

        gen = Generation(user_id=user.id, type="product_image", prompt=request.prompt, result=json.dumps(result, ensure_ascii=False))
        db.add(gen)
        db.add(UsageRecord(user_id=user.id, type="image"))
        await db.commit()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── History ───────────────────────────────────────────

class GenerationOut(BaseModel):
    id: str
    type: str
    prompt: str
    result: dict
    created_at: Optional[str] = None

class HistoryResponse(BaseModel):
    generations: list[GenerationOut]
    total: int
    page: int
    limit: int


@app.get("/api/history", response_model=HistoryResponse)
async def list_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    search: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Generation).where(Generation.user_id == user.id)
    count_q = select(func.count(Generation.id)).where(Generation.user_id == user.id)
    if type:
        q = q.where(Generation.type == type)
        count_q = count_q.where(Generation.type == type)
    if search:
        q = q.where(Generation.prompt.contains(search))
        count_q = count_q.where(Generation.prompt.contains(search))

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * limit
    result = await db.execute(
        q.order_by(desc(Generation.created_at)).offset(offset).limit(limit)
    )
    gens = result.scalars().all()

    return HistoryResponse(
        generations=[
            GenerationOut(
                id=g.id, type=g.type, prompt=g.prompt,
                result=json.loads(g.result), created_at=str(g.created_at) if g.created_at else None,
            )
            for g in gens
        ],
        total=total, page=page, limit=limit,
    )


@app.get("/api/history/{gen_id}", response_model=GenerationOut)
async def get_generation(
    gen_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Generation).where(Generation.id == gen_id, Generation.user_id == user.id)
    )
    gen = result.scalar_one_or_none()
    if not gen:
        raise HTTPException(status_code=404, detail="找不到此記錄")
    return GenerationOut(
        id=gen.id, type=gen.type, prompt=gen.prompt,
        result=json.loads(gen.result), created_at=str(gen.created_at) if gen.created_at else None,
    )


@app.delete("/api/history/{gen_id}")
async def delete_generation(
    gen_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Generation).where(Generation.id == gen_id, Generation.user_id == user.id)
    )
    gen = result.scalar_one_or_none()
    if not gen:
        raise HTTPException(status_code=404, detail="找不到此記錄")
    await db.delete(gen)
    await db.commit()
    return {"success": True}


# ── Billing ──────────────────────────────────────────

class CheckoutRequest(BaseModel):
    plan: str  # "pro" or "enterprise"

class BillingStatusResponse(BaseModel):
    plan: str
    text_usage: int
    text_limit: int
    image_usage: int
    image_limit: int


@app.post("/api/billing/checkout")
async def create_checkout(
    req: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.plan not in ("pro", "enterprise"):
        raise HTTPException(status_code=400, detail="無效的方案")

    from stripe_service import PLANS, PRO_PRICE_ID, ENTERPRISE_PRICE_ID, create_checkout_session, create_customer

    if not user.stripe_customer_id:
        customer = create_customer(email=user.email, name=user.name)
        user.stripe_customer_id = customer.id
        await db.commit()

    price_id = PRO_PRICE_ID if req.plan == "pro" else ENTERPRISE_PRICE_ID
    session = create_checkout_session(
        customer_id=user.stripe_customer_id,
        price_id=price_id,
        success_url="http://localhost:3000/billing?success=true",
        cancel_url="http://localhost:3000/pricing",
    )
    return {"checkout_url": session.url}


@app.get("/api/billing/status", response_model=BillingStatusResponse)
async def billing_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from stripe_service import PLANS

    plan_info = PLANS.get(user.plan, PLANS["free"])
    now_month = __import__("datetime").datetime.now().strftime("%Y-%m")

    text_result = await db.execute(
        select(func.count(UsageRecord.id)).where(
            UsageRecord.user_id == user.id,
            UsageRecord.type == "text",
            func.strftime("%Y-%m", UsageRecord.created_at) == now_month,
        )
    )
    image_result = await db.execute(
        select(func.count(UsageRecord.id)).where(
            UsageRecord.user_id == user.id,
            UsageRecord.type == "image",
            func.strftime("%Y-%m", UsageRecord.created_at) == now_month,
        )
    )

    return BillingStatusResponse(
        plan=user.plan,
        text_usage=text_result.scalar() or 0,
        text_limit=plan_info["text_limit"],
        image_usage=image_result.scalar() or 0,
        image_limit=plan_info["image_limit"],
    )


@app.post("/api/billing/portal")
async def billing_portal(
    user: User = Depends(get_current_user),
):
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="尚未設定付款資訊")
    from stripe_service import create_portal_session
    session = create_portal_session(
        customer_id=user.stripe_customer_id,
        return_url="http://localhost:3000/billing",
    )
    return {"portal_url": session.url}


@app.post("/api/webhooks/stripe")
async def stripe_webhook(request_body: bytes, db: AsyncSession = Depends(get_db)):
    import stripe
    from config import STRIPE_WEBHOOK_SECRET
    from stripe_service import PLANS

    payload = request_body
    sig_header = __import__("os").getenv("HTTP_STRIPE_SIGNATURE", "")

    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        except (stripe.error.SignatureVerificationError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        if customer_id:
            result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
            user = result.scalar_one_or_none()
            if user:
                user.plan = "pro"
                user.stripe_subscription_id = subscription_id
                await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        if customer_id:
            result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
            user = result.scalar_one_or_none()
            if user:
                user.plan = "free"
                await db.commit()

    return {"received": True}


# ── Health ────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
