import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_history_empty(client: AsyncClient, auth_headers: dict):
    resp = await client.get("/api/history", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["generations"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_history_unauthorized(client: AsyncClient):
    resp = await client.get("/api/history")
    assert resp.status_code == 401
