from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from argon2 import PasswordHasher
from jose import jwt
from fastapi import Response

from config import SECRET_KEY, JWT_ALG, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, COOKIE_SECURE


password_hasher = PasswordHasher()


def hash_password(plain_password: str) -> str:
    return password_hasher.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, plain_password)
    except Exception:
        return False


def create_access_token(subject: str, extra: Dict[str, Any] | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {"sub": subject, "iat": int(now.timestamp())}
    if extra:
        payload.update(extra)
    exp = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["exp"] = int(exp.timestamp())
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALG)


def create_refresh_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "iat": int(now.timestamp()), "exp": int(exp.timestamp()), "typ": "refresh"}
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALG)


def set_cookie_tokens(resp: Response, access: str | None, refresh: str | None) -> None:
    cookie_kwargs = {
        "httponly": True,
        "secure": COOKIE_SECURE,
        "samesite": "none",
        "path": "/",
    }
    if access is not None:
        resp.set_cookie("access_token", access, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, **cookie_kwargs)
    else:
        resp.delete_cookie("access_token", path="/")
    if refresh is not None:
        resp.set_cookie("refresh_token", refresh, max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600, **cookie_kwargs)
    else:
        resp.delete_cookie("refresh_token", path="/")


