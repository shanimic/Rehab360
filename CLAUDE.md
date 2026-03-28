# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rehab360 is a full-stack rehabilitation/therapy management web application. The backend is a FastAPI (Python) service using raw SQL (no ORM) against MySQL. The frontend (React/TypeScript) is planned but not yet implemented.

## Commands

### Backend Setup (Python 3.11+)
```bash
cd server
python -m venv .venv
source .venv/Scripts/activate  # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Run the Server
```bash
cd server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Tests
```bash
cd server
pytest                                        # all tests
pytest tests/unit/                            # unit tests only
pytest tests/unit/path/to/test_file.py        # specific file
pytest -k test_function_name                  # by pattern
pytest -v                                     # verbose
```

## Architecture

The backend follows a strict layered architecture. Each layer has a single responsibility and dependencies only flow downward:

```
api/ (route handlers) → services/ (business logic) → dal/ (raw SQL) → db/ (connection pool)
                     ↘                             ↗
                        models/ (Pydantic schemas)
```

- **`app/main.py`** — FastAPI entry point: app creation, CORS middleware, router registration, DB lifespan
- **`app/core/config.py`** — Pydantic `Settings` class loading all env vars
- **`app/core/security.py`** — Password hashing/verification (bcrypt/argon2 via pwdlib)
- **`app/api/`** — HTTP layer only: routing, request validation, calling services, returning models. Uses `Depends()` for injection.
- **`app/services/`** — Business logic. No HTTP, no direct DB access.
- **`app/dal/`** — Raw SQL queries only. Returns dicts or model instances. One module per resource.
- **`app/models/`** — Pydantic models for request/response shapes. The single source of data shape truth.
- **`app/db/session.py`** — aiomysql connection pool and `get_db()` FastAPI dependency

`dal/` and `models/` are siblings of `api/` (not nested under it) so non-API code (background jobs, scripts, tests) can reuse them without importing HTTP concerns.

### Database

MySQL database `rehab360`. No ORM — raw SQL via aiomysql (async). Connection config via `.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME). Schema and seed data in `db/init.sql`. Current tables: `users` (id, name, email, password, role, created_at, updated_at). Role values: `PATIENT`, `THERAPIST`.

## Code Style

Full rules in [docs/instructions/CODE_STYLE.md](docs/instructions/CODE_STYLE.md). Key rules:

- **Imports**: top-level only, never inside functions; group stdlib / third-party / local with blank lines; absolute imports only
- **Type hints**: required on all function signatures; use `T | None` not `Optional[T]`; lowercase builtins (`dict`, `list`, `set`); always annotate return type (including `-> None`)
- **Docstrings**: Google Style with `Args:`, `Returns:`, `Raises:` sections

## Testing

Full rules in [docs/instructions/TESTING_GUIDELINES.md](docs/instructions/TESTING_GUIDELINES.md). Key rules:

- Inherit from `unittest.TestCase`; run with `pytest`
- Test files: `test_*.py` | Test classes: `*Test` | Test methods: `test_*`
- Every test docstring uses **Given/When/Then**
- Every test body uses `# PREPARE / # MOCK / # ACT / # ASSERT` section comments
- Mocking: use `mockito` exclusively with `expect(..., times=N)`. Never use `unittest.mock` (no `patch`, `Mock`, `MagicMock`). Never use `when()` or `verify()`.
- Do not call `mockito.unstub()` in tearDown — pytest-mockito handles cleanup automatically
- Match mock parameter style (positional vs named) to the actual call site

## Instruction Index

- Backend structure: [server/docs/dev/FASTAPI_PROJECT_GUIDE.md](server/docs/dev/FASTAPI_PROJECT_GUIDE.md)
- Backend setup: [server/docs/dev/PROJECT_INITIALIZATION_GUIDE.md](server/docs/dev/PROJECT_INITIALIZATION_GUIDE.md)
- Code style: [docs/instructions/CODE_STYLE.md](docs/instructions/CODE_STYLE.md)
- Testing: [docs/instructions/TESTING_GUIDELINES.md](docs/instructions/TESTING_GUIDELINES.md)
- When editing under `server/` (excluding any future `client/`): follow backend instructions
- When editing under `client/`: follow frontend instructions (docs to be added)
