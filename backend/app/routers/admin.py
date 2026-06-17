from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from database import get_db, User, Generation, UsageRecord
from auth import verify_password, create_access_token, get_admin_user

router = APIRouter()


# ── Auth ──────────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    plan: str
    is_admin: bool
    has_api_key: bool = False

class AdminAuthResponse(BaseModel):
    user: AdminUserResponse
    access_token: str


@router.post("/api/admin/login", response_model=AdminAuthResponse)
async def admin_login(req: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email 或密碼錯誤")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="需要管理員權限")
    token = create_access_token(user.id)
    return AdminAuthResponse(
        user=AdminUserResponse(
            id=user.id, email=user.email, name=user.name,
            plan=user.plan, is_admin=user.is_admin,
            has_api_key=bool(user.openai_api_key),
        ),
        access_token=token,
    )


@router.get("/api/admin/me", response_model=AdminUserResponse)
async def admin_me(user: User = Depends(get_admin_user)):
    return AdminUserResponse(
        id=user.id, email=user.email, name=user.name,
        plan=user.plan, is_admin=user.is_admin,
        has_api_key=bool(user.openai_api_key),
    )


# ── Stats ─────────────────────────────────────────────

class PlanDistribution(BaseModel):
    plan: str
    count: int

class DashboardStats(BaseModel):
    total_users: int
    total_generations: int
    users_today: int
    generations_today: int
    revenue_estimate: float
    plan_distribution: list[PlanDistribution]


PLAN_PRICES = {"free": 0, "pro": 29, "enterprise": 99}


@router.get("/api/admin/stats", response_model=DashboardStats)
async def admin_stats(
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_generations = (await db.execute(select(func.count(Generation.id)))).scalar() or 0

    today = datetime.now(timezone.utc).date().isoformat()

    users_today = (await db.execute(
        select(func.count(User.id)).where(func.date(User.created_at) == today)
    )).scalar() or 0

    generations_today = (await db.execute(
        select(func.count(Generation.id)).where(func.date(Generation.created_at) == today)
    )).scalar() or 0

    plan_result = await db.execute(
        select(User.plan, func.count(User.id)).group_by(User.plan)
    )
    plan_dist = [PlanDistribution(plan=row[0], count=row[1]) for row in plan_result.all()]

    revenue_estimate = sum(PLAN_PRICES.get(p.plan, 0) * p.count for p in plan_dist)

    return DashboardStats(
        total_users=total_users,
        total_generations=total_generations,
        users_today=users_today,
        generations_today=generations_today,
        revenue_estimate=revenue_estimate,
        plan_distribution=plan_dist,
    )


# ── Users ─────────────────────────────────────────────

class UserListItem(BaseModel):
    id: str
    email: str
    name: Optional[str]
    plan: str
    is_admin: bool
    has_api_key: bool
    created_at: Optional[str]
    generation_count: int

class UserListResponse(BaseModel):
    users: list[UserListItem]
    total: int
    page: int
    limit: int

class UserDetailResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    plan: str
    is_admin: bool
    has_api_key: bool
    created_at: Optional[str]
    generations: list[dict]

class ChangePlanRequest(BaseModel):
    plan: str


@router.get("/api/admin/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    plan: Optional[str] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(User)
    count_q = select(func.count(User.id))

    if search:
        like = f"%{search}%"
        q = q.where(User.email.ilike(like) | User.name.ilike(like))
        count_q = count_q.where(User.email.ilike(like) | User.name.ilike(like))
    if plan:
        q = q.where(User.plan == plan)
        count_q = count_q.where(User.plan == plan)

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * limit
    result = await db.execute(
        q.order_by(desc(User.created_at)).offset(offset).limit(limit)
    )
    users = result.scalars().all()

    items = []
    for u in users:
        gen_count = (await db.execute(
            select(func.count(Generation.id)).where(Generation.user_id == u.id)
        )).scalar() or 0
        items.append(UserListItem(
            id=u.id, email=u.email, name=u.name,
            plan=u.plan, is_admin=u.is_admin,
            has_api_key=bool(u.openai_api_key),
            created_at=str(u.created_at) if u.created_at else None,
            generation_count=gen_count,
        ))

    return UserListResponse(users=items, total=total, page=page, limit=limit)


@router.get("/api/admin/users/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="找不到此使用者")

    gens_result = await db.execute(
        select(Generation)
        .where(Generation.user_id == user_id)
        .order_by(desc(Generation.created_at))
        .limit(50)
    )
    gens = gens_result.scalars().all()

    import json
    generations = [
        {
            "id": g.id, "type": g.type, "prompt": g.prompt,
            "result": json.loads(g.result),
            "created_at": str(g.created_at) if g.created_at else None,
        }
        for g in gens
    ]

    return UserDetailResponse(
        id=user.id, email=user.email, name=user.name,
        plan=user.plan, is_admin=user.is_admin,
        has_api_key=bool(user.openai_api_key),
        created_at=str(user.created_at) if user.created_at else None,
        generations=generations,
    )


@router.put("/api/admin/users/{user_id}/plan")
async def change_user_plan(
    user_id: str,
    req: ChangePlanRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if req.plan not in ("free", "pro", "enterprise"):
        raise HTTPException(status_code=400, detail="無效的方案")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="找不到此使用者")

    user.plan = req.plan
    await db.commit()
    return {"success": True, "plan": req.plan}


@router.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="找不到此使用者")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="不能刪除管理員帳號")

    await db.execute(
        select(Generation).where(Generation.user_id == user_id)
    )
    from sqlalchemy import delete
    await db.execute(delete(Generation).where(Generation.user_id == user_id))
    await db.execute(delete(UsageRecord).where(UsageRecord.user_id == user_id))
    await db.delete(user)
    await db.commit()
    return {"success": True}


# ── Generations ───────────────────────────────────────

class AdminGenerationOut(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str]
    type: str
    prompt: str
    result: dict
    created_at: Optional[str]

class AdminGenerationListResponse(BaseModel):
    generations: list[AdminGenerationOut]
    total: int
    page: int
    limit: int


@router.get("/api/admin/generations", response_model=AdminGenerationListResponse)
async def list_all_generations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    user_id: Optional[str] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Generation)
    count_q = select(func.count(Generation.id))

    if type:
        q = q.where(Generation.type == type)
        count_q = count_q.where(Generation.type == type)
    if user_id:
        q = q.where(Generation.user_id == user_id)
        count_q = count_q.where(Generation.user_id == user_id)

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * limit
    result = await db.execute(
        q.order_by(desc(Generation.created_at)).offset(offset).limit(limit)
    )
    gens = result.scalars().all()

    import json
    items = []
    for g in gens:
        user_result = await db.execute(select(User.email).where(User.id == g.user_id))
        user_email = user_result.scalar_one_or_none()
        items.append(AdminGenerationOut(
            id=g.id, user_id=g.user_id, user_email=user_email,
            type=g.type, prompt=g.prompt,
            result=json.loads(g.result),
            created_at=str(g.created_at) if g.created_at else None,
        ))

    return AdminGenerationListResponse(generations=items, total=total, page=page, limit=limit)


# ── Generation Stats ──────────────────────────────────

class DailyStat(BaseModel):
    date: str
    count: int

class TypeStat(BaseModel):
    type: str
    count: int

class PlatformStat(BaseModel):
    platform: str
    count: int

class GenerationStatsResponse(BaseModel):
    by_day: list[DailyStat]
    by_type: list[TypeStat]
    by_platform: list[PlatformStat]


@router.get("/api/admin/generations/stats", response_model=GenerationStatsResponse)
async def generation_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

    day_result = await db.execute(
        select(func.date(Generation.created_at), func.count(Generation.id))
        .where(Generation.created_at >= thirty_days_ago)
        .group_by(func.date(Generation.created_at))
        .order_by(func.date(Generation.created_at))
    )
    by_day = [DailyStat(date=row[0], count=row[1]) for row in day_result.all()]

    type_result = await db.execute(
        select(Generation.type, func.count(Generation.id))
        .group_by(Generation.type)
    )
    by_type = [TypeStat(type=row[0], count=row[1]) for row in type_result.all()]

    platform_result = await db.execute(
        select(Generation.type, func.count(Generation.id))
        .group_by(Generation.type)
    )
    by_platform = [PlatformStat(platform=row[0], count=row[1]) for row in platform_result.all()]

    return GenerationStatsResponse(by_day=by_day, by_type=by_type, by_platform=by_platform)


# ── Usage Stats ───────────────────────────────────────

class UsageStatsResponse(BaseModel):
    total_text: int
    total_image: int
    daily: list[DailyStat]


@router.get("/api/admin/usage", response_model=UsageStatsResponse)
async def usage_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_text = (await db.execute(
        select(func.count(UsageRecord.id)).where(UsageRecord.type == "text")
    )).scalar() or 0

    total_image = (await db.execute(
        select(func.count(UsageRecord.id)).where(UsageRecord.type == "image")
    )).scalar() or 0

    day_result = await db.execute(
        select(func.date(UsageRecord.created_at), func.count(UsageRecord.id))
        .group_by(func.date(UsageRecord.created_at))
        .order_by(desc(func.date(UsageRecord.created_at)))
        .limit(30)
    )
    daily = [DailyStat(date=row[0], count=row[1]) for row in day_result.all()]

    return UsageStatsResponse(total_text=total_text, total_image=total_image, daily=daily)
