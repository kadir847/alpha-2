# Alpha 2

Alpha 2 is a full-stack SaaS-style AI assistant built with FastAPI, SQLite/PostgreSQL, optional Redis, React, TypeScript, Tailwind CSS, Zustand, and TanStack Query.

## Quick Start

### 1. Configure environment

Copy the example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

The default local setup uses SQLite and demo AI mode, so signup/login/chat can be tested without Docker, PostgreSQL, Redis, or an AI API key.

### 2. Beginner Local Mode

Backend:

```powershell
cd "C:\Users\hp\Downloads\alpha 2\backend"
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Frontend in another PowerShell window:

```powershell
cd "C:\Users\hp\Downloads\alpha 2\frontend"
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

In local mode, the database is a file at `backend/alpha2.db`. Tables are created automatically when the backend starts.

### 3. Run with Docker

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### 4. Production-Style Local Mode

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Architecture

```text
frontend React app
  -> REST + fetch streaming
backend FastAPI
  -> auth, chat, persistence, rate limiting
AI provider layer
  -> Groq, OpenAI, Anthropic
SQLite/PostgreSQL
  -> users, conversations, messages
Redis
  -> optional rate limit counters
```

## Main API Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /chat`
- `POST /chat/stream`
- `GET /conversations`
- `GET /conversations/{id}`
- `DELETE /conversations/{id}`
- `GET /health`
