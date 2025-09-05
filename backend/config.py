import os
from pathlib import Path
try:
    from dotenv import load_dotenv
    # Load backend/.env when running locally
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(env_path.as_posix())
except Exception:
    # dotenv is optional in prod; ignore if missing
    pass
from typing import List


def get_env(key: str, default: str | None = None) -> str | None:
    value = os.getenv(key, default)
    return value


SECRET_KEY: str = get_env("SECRET_KEY", "change_me") or "change_me"
JWT_ALG: str = get_env("JWT_ALG", "HS256") or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(get_env("ACCESS_TOKEN_EXPIRE_MINUTES", "15") or 15)
REFRESH_TOKEN_EXPIRE_DAYS: int = int(get_env("REFRESH_TOKEN_EXPIRE_DAYS", "7") or 7)
ADMIN_USERNAME: str = get_env("ADMIN_USERNAME", "admin") or "admin"
ADMIN_PASSWORD: str = get_env("ADMIN_PASSWORD", "change_me_now") or "change_me_now"
CORS_ORIGINS_ENV: str = get_env("CORS_ORIGINS", "https://noelillinger.github.io") or "https://noelillinger.github.io"
COOKIE_SECURE: bool = (get_env("COOKIE_SECURE", "true") or "true").lower() == "true"
DATABASE_URL: str = get_env("DATABASE_URL", "sqlite+aiosqlite:///./dadpoker.db") or "sqlite+aiosqlite:///./dadpoker.db"


def get_cors_origins() -> List[str]:
    if not CORS_ORIGINS_ENV:
        return []
    return [o.strip() for o in CORS_ORIGINS_ENV.split(",") if o.strip()]


