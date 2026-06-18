import datetime
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import User, UsageRecord


async def check_usage_limit(user: User, usage_type: str, db: AsyncSession):
    """Check if user has remaining usage for the given type. Raises 403 if exceeded."""
    from stripe_service import PLANS

    plan_info = PLANS.get(user.plan, PLANS["free"])
    limit = plan_info[f"{usage_type}_limit"]
    if limit == -1:
        return

    now_month = datetime.datetime.now().strftime("%Y-%m")
    result = await db.execute(
        select(func.count(UsageRecord.id)).where(
            UsageRecord.user_id == user.id,
            UsageRecord.type == usage_type,
            func.strftime("%Y-%m", UsageRecord.created_at) == now_month,
        )
    )
    current_usage = result.scalar() or 0

    if current_usage >= limit:
        type_label = "文案" if usage_type == "text" else "圖片"
        raise HTTPException(
            status_code=403,
            detail=f"本月{type_label}生成次數已達上限（{current_usage}/{limit}）。請升級方案以繼續使用。",
        )
