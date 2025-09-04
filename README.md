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

### Backend endpoints and access
- API base: `/api/v1`
- Auth: `/auth/login`, `/auth/refresh`, `/auth/logout`
- Me: `/me`, `/me/password`
- Admin: `/admin/users` CRUD
- User profile/history: `/user`, `/user/reset`, `/user/settings`, `/history`
- WebSocket: `/ws/table/{table_id}`
- Health: `/health` (admin-only)
- Docs: default docs disabled; admin-only docs are served at `/api/v1/admin/docs` and `/api/v1/admin/openapi.json` after admin login

### Local development
Backend (from `backend/`):
```bash
pip install -r requirements.txt
export DATABASE_URL=sqlite+aiosqlite:///./dadpoker.db
export SECRET_KEY=dev_change_me
export JWT_ALG=HS256
export ACCESS_TOKEN_EXPIRE_MINUTES=15
export REFRESH_TOKEN_EXPIRE_DAYS=7
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=change_me_now
export CORS_ORIGINS=http://localhost:5173
export COOKIE_SECURE=false
uvicorn main:app --reload --port 8000
```

Frontend (from `frontend/`):
```bash
npm install
VITE_API_BASE=http://localhost:8000 npm run dev
```

### Deployment

Backend (Railway)
- Use the provided `Dockerfile` at repo root. Set the service root to `backend/` when creating the service, or ensure the Docker build context includes `backend/`.
- Configure environment variables (no secrets in repo):
  - `SECRET_KEY`, `JWT_ALG=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=15`, `REFRESH_TOKEN_EXPIRE_DAYS=7`
  - `ADMIN_USERNAME`, `ADMIN_PASSWORD`
  - `CORS_ORIGINS` (e.g., your GitHub Pages origin)
  - `COOKIE_SECURE=true`
  - `DATABASE_URL=sqlite+aiosqlite:///./dadpoker.db`
  - `PORT=8000`
- Expose port 8000.

Frontend (GitHub Pages)
- Workflow is at `.github/workflows/pages.yml`.
- Create a repo secret `VITE_API_BASE` with your Railway URL.
- Push to `main` to trigger build; Pages will deploy `frontend/dist` using the workflow.

Notes
- Cookies are `httpOnly`, `Secure`, `SameSite=None` to work on GitHub Pages.
- API docs are disabled by default routes; use the admin-only docs route after logging in as admin.


