# AI Content Generator

智能內容創作者 - 一鍵生成專業社群文案與產品圖片

## 功能特色

- **文案生成**: 支援 Instagram、Facebook、Twitter、LinkedIn、部落格
- **圖片生成**: 使用 DALL-E 3 生成高品質圖片
- **多種風格**: 專業、輕鬆、創意、教學
- **繁體中文**: 完整支援繁體中文介面

## 技術棧

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **後端**: FastAPI + Python
- **AI**: OpenAI GPT-4 + DALL-E 3
- **部署**: Vercel (前端) + Railway (後端)

## 快速開始

### 1. 克隆專案

```bash
git clone <your-repo-url>
cd ai-content-generator
```

### 2. 設置後端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 編輯 .env 填入你的 API Keys
python main.py
```

### 3. 設置前端

```bash
cd frontend
npm install
npm run dev
```

### 4. 訪問

- 前端: http://localhost:3000
- 後端 API: http://localhost:8000
- API 文檔: http://localhost:8000/docs

## 環境變數

在 `backend/.env` 中設置：

```
OPENAI_API_KEY=sk-your-openai-key
REPLICATE_API_TOKEN=r8-your-replicate-token
```

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/generate/text` | 生成文案 |
| POST | `/api/generate/image` | 生成圖片 |
| POST | `/api/generate/product-image` | 生成產品圖片 |
| GET | `/api/health` | 健康檢查 |

## 部署

### 前端 (Vercel)

1. Push 到 GitHub
2. 在 Vercel 導入專案
3. 設置環境變數 `NEXT_PUBLIC_API_URL`

### 後端 (Railway)

1. 在 Railway 建立新專案
2. 連接 GitHub repo
3. 設置環境變數

## 授權

MIT License
