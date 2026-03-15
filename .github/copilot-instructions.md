# Project instructions for GitHub Copilot

This file is the project’s instructions for GitHub Copilot. The repo’s agent index is [AGENTS.md](../AGENTS.md) at the repo root.

Follow this project's instructions from the docs folder. Do not invent conventions; use the ones defined there.

## Where to get instructions

- **Backend (Python / FastAPI)** — `app/docs/`
  - `app/docs/instructions/` — CODE_STYLE.md, TESTING_GUIDELINES.md
  - `app/docs/dev/FASTAPI_PROJECT_GUIDE.md` — structure, folder roles

- **Frontend (React / TypeScript)** — `app/client/docs/dev/instructions/`
  - REACT_TYPESCRIPT.md, TANSTACK_*.md, SHADCN_COMPONENTS.md, VITE.md

## Rule of thumb

- When editing under `app/` **excluding** `app/client/`, prefer **backend** instructions.
- When editing under `app/client/`, prefer **frontend** instructions.
- Follow shared docs (e.g. CODE_STYLE, TESTING_GUIDELINES) where they apply to the code you are editing.
