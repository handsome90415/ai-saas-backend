import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient


@pytest.mark.asyncio
@patch('main.openai_client')
async def test_generate_text(mock_openai, client: AsyncClient, auth_headers: dict):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content='{"title": "Test", "content": "Content", "hashtags": ["tag1"]}'))]
    mock_openai.chat.completions.create.return_value = mock_response

    resp = await client.post(
        "/api/generate/text",
        json={"prompt": "test prompt", "style": "professional", "platform": "instagram"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "title" in data
    assert "content" in data
    assert "hashtags" in data


@pytest.mark.asyncio
async def test_generate_text_unauthorized(client: AsyncClient):
    resp = await client.post(
        "/api/generate/text",
        json={"prompt": "test prompt"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
@patch('main.openai_client')
async def test_generate_image(mock_openai, client: AsyncClient, auth_headers: dict):
    mock_response = MagicMock()
    mock_response.data = [MagicMock(url="https://example.com/image.png", revised_prompt="revised")]
    mock_openai.images.generate.return_value = mock_response

    resp = await client.post(
        "/api/generate/image",
        json={"prompt": "test image", "style": "realistic"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "image_url" in data
    assert "revised_prompt" in data


@pytest.mark.asyncio
async def test_generate_image_unauthorized(client: AsyncClient):
    resp = await client.post(
        "/api/generate/image",
        json={"prompt": "test image"},
    )
    assert resp.status_code == 401
