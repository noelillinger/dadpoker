from typing import Optional
from fastapi import Request
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from sqlalchemy import select

from config import SECRET_KEY, JWT_ALG
from database import AsyncSessionLocal
from models import User


ALLOWLIST = {
    ("POST", "/api/v1/auth/login"),
    ("POST", "/api/v1/auth/refresh"),
    ("POST", "/api/v1/auth/logout"),
}


async def _extract_token(request: Request) -> Optional[str]:
    token = request.cookies.get("access_token")
    if token:
        return token
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    return None


async def admin_only_middleware(request: Request, call_next):
    # Always allow CORS preflight
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path
    method = request.method.upper()
    if (method, path) in ALLOWLIST:
        return await call_next(request)

    # Require admin for everything else (including health and docs)
    token = await _extract_token(request)
    if not token:
        return JSONResponse({"detail": "Not authenticated"}, status_code=401)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALG])
        username = payload.get("sub")
        if not username:
            return JSONResponse({"detail": "Invalid token"}, status_code=401)
    except JWTError:
        return JSONResponse({"detail": "Invalid token"}, status_code=401)

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.username == username))
        user = res.scalar_one_or_none()
        if not user or not user.is_active or user.role != "admin":
            return JSONResponse({"detail": "Admin only"}, status_code=403)

    return await call_next(request)


