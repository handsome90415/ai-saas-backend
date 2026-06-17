import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_update_profile(client: AsyncClient, auth_headers: dict):
    resp = await client.put(
        "/api/auth/profile",
        json={"name": "New Name"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "New Name"


@pytest.mark.asyncio
async def test_update_profile_unauthorized(client: AsyncClient):
    resp = await client.put(
        "/api/auth/profile",
        json={"name": "New Name"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_change_password(client: AsyncClient, auth_headers: dict):
    resp = await client.put(
        "/api/auth/password",
        json={"current_password": "password123", "new_password": "newpass123"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True


@pytest.mark.asyncio
async def test_change_password_wrong_current(client: AsyncClient, auth_headers: dict):
    resp = await client.put(
        "/api/auth/password",
        json={"current_password": "wrongpass", "new_password": "newpass123"},
        headers=auth_headers,
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_change_password_too_short(client: AsyncClient, auth_headers: dict):
    resp = await client.put(
        "/api/auth/password",
        json={"current_password": "password123", "new_password": "123"},
        headers=auth_headers,
    )
    assert resp.status_code == 400
