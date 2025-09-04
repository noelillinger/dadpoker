from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slowapi.util import get_remote_address
from slowapi import Limiter

from database import get_db_session
from models import User
from security import verify_password, hash_password, create_access_token, create_refresh_token, set_cookie_tokens
from schemas import LoginRequest, MeOut, ChangePasswordRequest, LoginResponse, RefreshResponse
from deps import get_current_user


router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/auth/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def login(request: Request, payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db_session)):
    res = await db.execute(select(User).where(User.username == payload.username))
    user = res.scalar_one_or_none()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access = create_access_token(user.username, {"role": user.role})
    refresh = create_refresh_token(user.username)
    set_cookie_tokens(response, access, refresh)
    return {"access": access, "refresh": refresh, "me": {"id": user.id, "username": user.username, "role": user.role, "is_active": user.is_active, "must_change_password": user.must_change_password, "balance": user.balance}}


@router.post("/auth/refresh", response_model=RefreshResponse)
@limiter.limit("10/minute")
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db_session)):
    refresh = request.cookies.get("refresh_token")
    if not refresh:
        auth = request.headers.get("Authorization", "")
        if auth.lower().startswith("bearer "):
            refresh = auth.split(" ", 1)[1]
    if not refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    from jose import jwt, JWTError
    from ..config import SECRET_KEY, JWT_ALG

    try:
        payload = jwt.decode(refresh, SECRET_KEY, algorithms=[JWT_ALG])
        if payload.get("typ") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        sub = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    res = await db.execute(select(User).where(User.username == sub))
    user = res.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not active")
    access = create_access_token(user.username, {"role": user.role})
    # rotate refresh token
    new_refresh = create_refresh_token(user.username)
    set_cookie_tokens(response, access, new_refresh)
    return {"access": access, "refresh": new_refresh, "me": {"id": user.id, "username": user.username, "role": user.role, "is_active": user.is_active, "must_change_password": user.must_change_password, "balance": user.balance}}


@router.post("/auth/logout")
async def logout(response: Response):
    set_cookie_tokens(response, None, None)
    return {"ok": True}


@router.get("/me", response_model=MeOut)
async def get_me(current: User = Depends(get_current_user)):
    return current


@router.patch("/me/password")
async def change_password(payload: ChangePasswordRequest, response: Response, current: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    if not verify_password(payload.old_password, current.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password incorrect")
    current.password_hash = hash_password(payload.new_password)
    current.must_change_password = False
    await db.commit()
    # rotate tokens after password change
    access = create_access_token(current.username, {"role": current.role})
    refresh = create_refresh_token(current.username)
    set_cookie_tokens(response, access, refresh)
    return {"ok": True}


