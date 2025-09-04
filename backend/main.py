from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_cors_origins, ADMIN_USERNAME, ADMIN_PASSWORD
from database import engine, Base, AsyncSessionLocal
from models import User
from security import hash_password

from routers import auth as auth_router
from routers import admin as admin_router
from routers import user as user_router
from routers import game as game_router


limiter = Limiter(key_func=get_remote_address, default_limits=[])

app = FastAPI(title="DadPoker API", version="0.1.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.on_event("startup")
async def on_startup() -> None:
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Bootstrap admin if no users exist
    async with AsyncSessionLocal() as session:  # type: AsyncSession
        res = await session.execute(select(func.count(User.id)))
        count = res.scalar_one()
        if count == 0:
            admin = User(
                username=ADMIN_USERNAME,
                role="admin",
                password_hash=hash_password(ADMIN_PASSWORD),
                is_active=True,
                must_change_password=True,
                balance=1000000,  # $10,000 for admin by default
            )
            session.add(admin)
            await session.commit()


from deps import get_admin_user


@app.get("/api/v1/health")
async def health(_: User = Depends(get_admin_user)):
    return {"status": "ok"}


@app.get("/api/v1/admin/openapi.json")
async def openapi_json(_: User = Depends(get_admin_user)):
    return app.openapi()


@app.get("/api/v1/admin/docs")
async def swagger_ui(_: User = Depends(get_admin_user)):
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(openapi_url="/api/v1/admin/openapi.json", title="DadPoker API Docs")


# Routers
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(admin_router.router, prefix="/api/v1")
app.include_router(user_router.router, prefix="/api/v1")
app.include_router(game_router.router, prefix="/api/v1")


