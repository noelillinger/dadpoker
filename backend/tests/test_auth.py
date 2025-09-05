import pytest
from httpx import AsyncClient
from fastapi import status


@pytest.fixture
def app():
    # Provide FastAPI app instance for httpx AsyncClient
    from backend.main import app as fastapi_app
    return fastapi_app


@pytest.mark.asyncio
async def test_health(app):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.get("/api/v1/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


