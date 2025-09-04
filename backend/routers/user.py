from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from deps import get_current_user
from database import get_db_session
from models import User, Setting, Hand
from schemas import UserSettingsRequest, UserSettingsResponse, UserProfileResponse, HistoryResponse, HandItem


router = APIRouter(tags=["user"])


def _settings_key(user_id: int, name: str) -> str:
    return f"user:{user_id}:{name}"


@router.get("/user", response_model=UserProfileResponse)
async def get_user_profile(current: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    key = _settings_key(current.id, "auto_rebuy")
    res = await db.execute(select(Setting).where(Setting.key == key))
    s = res.scalar_one_or_none()
    auto_rebuy = s.value == "1" if s else False
    return {"balance": current.balance, "auto_rebuy": auto_rebuy}


@router.post("/user/reset")
async def reset_user(current: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    current.balance = 100000  # $1,000
    await db.commit()
    return {"ok": True}


@router.post("/user/settings", response_model=UserSettingsResponse)
async def set_user_settings(data: UserSettingsRequest, current: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    auto_rebuy = bool(data.auto_rebuy) if data.auto_rebuy is not None else False
    key = _settings_key(current.id, "auto_rebuy")
    res = await db.execute(select(Setting).where(Setting.key == key))
    s = res.scalar_one_or_none()
    if s:
        s.value = "1" if auto_rebuy else "0"
    else:
        db.add(Setting(key=key, value=("1" if auto_rebuy else "0")))
    await db.commit()
    return {"auto_rebuy": auto_rebuy}


@router.get("/history", response_model=HistoryResponse)
async def get_history(limit: int = 50, current: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    q = select(Hand).where(Hand.user_id == current.id).order_by(Hand.ts.desc()).limit(limit)
    res = await db.execute(q)
    rows = res.scalars().all()
    items = [HandItem(id=h.id, ts=h.ts.isoformat(), delta=h.delta, difficulty=h.difficulty, players=h.players) for h in rows]
    return {"items": items}


