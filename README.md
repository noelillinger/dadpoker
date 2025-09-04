## DadPoker

Lightweight Texas Hold’em single-table poker app. Frontend: React (Vite, JS). Backend: FastAPI. Auth with admin role, user management, bots, and WebSocket gameplay.

### Tech
- Frontend: React (Vite, JavaScript only), Zustand, Axios, React Router
- Backend: FastAPI, SQLAlchemy (SQLite), aiosqlite, Argon2, python-jose, websockets, slowapi
- Deploy: GitHub Pages (frontend), Railway (backend)

### Repo Layout
```
dadpoker/
  backend/
  frontend/
  docs/
  .github/workflows/pages.yml
  Dockerfile
  README.md
```

### Environment
Create a `.env` file for the backend (use `.env.example` as a template):

```
SECRET_KEY=change_me
JWT_ALG=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me_now
CORS_ORIGINS=https://<your-gh-username>.github.io
COOKIE_SECURE=true
DATABASE_URL=sqlite+aiosqlite:///./dadpoker.db
```

Frontend `.env` (inside `frontend/`, see `frontend/.env.example`):

```
VITE_API_BASE=https://<your-railway-app>.up.railway.app
```

Note: For local dev, you can set `VITE_API_BASE=http://localhost:8000` and `COOKIE_SECURE=false` for cookies over http.

### Local Development

Backend (in `backend/`):
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend (in `frontend/`):
```bash
npm i
npm run dev
```

### Deployment

- Frontend via GitHub Pages using `.github/workflows/pages.yml`. Set `VITE_API_BASE` repo secret to your Railway URL.
- Backend via Railway using the provided `Dockerfile`. Set environment variables from `.env.example`. Expose port `8000`.

### Acceptance Checklist
- Login/logout with httpOnly cookies
- Admin can create/reset/disable users
- Game plays end-to-end with bots and correct payouts
- Balance persists (SQLite) and history shows recent hands
- No TypeScript files or deps

### License
MIT


