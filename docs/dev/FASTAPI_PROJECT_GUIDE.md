# Physical Therapist Central (PT-Central) Backend Template

This document outlines the architecture, naming conventions, and implementation strategy for the PT-Central backend using **FastAPI**, **Pydantic**, and **raw SQL** (no ORM).

---

## Project Structure

Repo root has two top-level folders: **server** (FastAPI backend) and **client** (frontend). Below is the **server** tree.

```text
server/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point: initializes FastAPI app and includes routers
│   ├── core/                # Global config (Env vars, security, constants)
│   │   ├── config.py
│   │   └── security.py
│   ├── api/                 # API route handlers (Controllers)
│   │   ├── api.py           # Includes all routers
│   │   └── endpoints/
│   │       ├── users.py
│   │       └── items.py
│   ├── dal/                 # Data access: raw SQL, one module per resource
│   │   ├── user.py
│   │   └── item.py
│   ├── models/              # Pydantic models (request/response validation)
│   │   ├── user.py
│   │   └── item.py
│   ├── db/                  # Database connection pool and get_db dependency
│   │   └── session.py
│   └── tests/               # Pytest suite
├── .env                     # Secrets (DATABASE_URL, SECRET_KEY)
├── .gitignore
├── docker-compose.yml
├── requirements.txt
└── README.md
```

```text
client/                      # Frontend (separate docs)
```

---

## Folder roles

- `**main.py**` — Entry point: creates the FastAPI app, includes the API router, and wires lifespan (e.g. DB session lifecycle).
- `**core/**` — Global config and security: `config.py` loads env (e.g. Pydantic Settings); `security.py` holds auth/security helpers (tokens, password hashing).
- `**api/**` — API route handlers: `api.py` includes all routers; `endpoints/` has one module per resource (`users.py`, `items.py`). Endpoints use `Depends()` for DB session and auth, call **dal** and return **models**.
- `**dal/`** — Data access layer (raw SQL, one module per resource: `user.py`, `item.py`). No HTTP or routing logic. Return dicts or **model** instances.
- `**models/`** — Pydantic models for request/response validation. The single source of data shapes (no ORM).
- `**db/**` — Database connection pool and `get_db()` dependency for database access.
- `**tests/**` — Pytest suite.

**Why dal and models are not under api/** — They live as siblings of `api/` so the dependency direction stays correct: api depends on dal and models, not the other way around. Non-API code (e.g. background jobs, scripts, tests) can reuse the same dal and models.