from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from deps import get_admin_user
from database import get_db_session
from models import User
from schemas import CreateUserRequest, UpdateUserRequest, UserOut, UserListResponse
from security import hash_password


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=UserListResponse)
async def list_users(_: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db_session)):
    res = await db.execute(select(User))
    users = res.scalars().all()
    return {"users": users}


@router.post("/users", response_model=UserOut)
async def create_user(data: CreateUserRequest, _: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db_session)):
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    user = User(
        username=data.username,
        role=data.role,
        password_hash=hash_password(data.temp_password),
        is_active=True,
        must_change_password=True,
        balance=100000,  # $1,000 seed
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, data: UpdateUserRequest, _: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db_session)):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.role is not None:
        user.role = data.role
    if data.must_change_password is not None:
        user.must_change_password = data.must_change_password
    if data.temp_password is not None:
        user.password_hash = hash_password(data.temp_password)
        user.must_change_password = True
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, _: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db_session)):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"ok": True}


