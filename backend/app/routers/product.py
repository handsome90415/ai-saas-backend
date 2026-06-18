from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import base64
from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, User, Generation, UsageRecord
from auth import get_current_user
from usage import check_usage_limit

router = APIRouter()


class ProductAnalysisResponse(BaseModel):
    name: str
    description: str
    features: list[str]
    target_audience: str
    marketing_suggestions: list[str]


class GenerateProductContentRequest(BaseModel):
    product_name: str
    product_description: str
    platform: str
    style: str


class ProductContentResponse(BaseModel):
    title: str
    content: str
    hashtags: list[str]
    cta: str


@router.post("/api/product/analyze", response_model=ProductAnalysisResponse)
async def analyze_product_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.openai_api_key:
        raise HTTPException(status_code=400, detail="請先在設定中新增 OpenAI API Key")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="請上傳圖片檔案")

    await check_usage_limit(user, "text", db)
    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode("utf-8")

        client = OpenAI(api_key=user.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """請分析這張產品圖片，並以 JSON 格式回傳以下資訊：
{
  "name": "產品名稱",
  "description": "產品描述（100-200字）",
  "features": ["特色1", "特色2", "特色3"],
  "target_audience": "目標受眾描述",
  "marketing_suggestions": ["行銷建議1", "行銷建議2", "行銷建議3"]
}

請確保回傳的是有效的 JSON 格式。"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file.content_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
        )

        import json
        result = json.loads(response.choices[0].message.content)

        gen = Generation(
            user_id=user.id,
            type="product_analysis",
            prompt=f"分析產品圖片: {file.filename}",
            result=json.dumps(result, ensure_ascii=False)
        )
        db.add(gen)
        db.add(UsageRecord(user_id=user.id, type="text"))
        await db.commit()

        return ProductAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/product/generate-content", response_model=ProductContentResponse)
async def generate_product_content(
    request: GenerateProductContentRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.openai_api_key:
        raise HTTPException(status_code=400, detail="請先在設定中新增 OpenAI API Key")

    await check_usage_limit(user, "text", db)

    platform_context = {
        "instagram": "Instagram 貼文，需要吸引人的標題、內容和 hashtag",
        "facebook": "Facebook 貼文，適合長文分享和互動",
        "twitter": "Twitter/X 貼文，簡潔有力，適合快速傳播",
        "linkedin": "LinkedIn 專業文章，適合 B2B 行銷",
        "blog": "部落格文章，SEO 友善，詳細介紹",
        "tiktok": "TikTok 短影音腳本，創意吸睛",
        "youtube": "YouTube 影片腳本，適合長內容",
    }

    style_prompts = {
        "professional": "專業、正式的商業語氣",
        "casual": "輕鬆、友善的口語風格",
        "creative": "有創意、吸睛的行銷文案",
        "humorous": "幽默、有趣的風格",
        "persuasive": "說服力強，強調價值和好處",
        "luxury": "奢華、高端的語氣",
        "emotional": "觸動情感，引起共鳴",
        "urgent": "製造緊迫感，促使立即行動",
        "storytelling": "用故事的方式敘述",
        "trendy": "潮流、網紅風格，使用流行用語",
    }

    try:
        client = OpenAI(api_key=user.openai_api_key)
        system_prompt = f"""你是一個專業的社群行銷專家。
根據提供的產品資訊，為 {platform_context.get(request.platform, '社群平台')} 創建行銷內容。
語氣風格: {style_prompts.get(request.style, style_prompts['professional'])}

請以 JSON 格式回傳：
{{
  "title": "吸睛標題",
  "content": "主要內容",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "cta": "行動呼籲（Call to Action）"
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"產品名稱: {request.product_name}\n\n產品描述: {request.product_description}"},
            ],
            response_format={"type": "json_object"},
        )

        import json
        result = json.loads(response.choices[0].message.content)

        gen = Generation(
            user_id=user.id,
            type="product_content",
            prompt=f"為 {request.product_name} 生成 {request.platform} 內容",
            result=json.dumps(result, ensure_ascii=False)
        )
        db.add(gen)
        db.add(UsageRecord(user_id=user.id, type="text"))
        await db.commit()

        return ProductContentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/product/analyses")
async def list_product_analyses(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select, desc
    result = await db.execute(
        select(Generation)
        .where(Generation.user_id == user.id, Generation.type == "product_analysis")
        .order_by(desc(Generation.created_at))
        .limit(10)
    )
    generations = result.scalars().all()

    import json
    return [
        {
            "id": g.id,
            "prompt": g.prompt,
            "result": json.loads(g.result),
            "created_at": str(g.created_at) if g.created_at else None,
        }
        for g in generations
    ]
