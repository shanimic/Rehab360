# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rehab360 is a full-stack rehabilitation/therapy management web application. The backend is a FastAPI (Python) service using raw SQL (no ORM) against MySQL. The frontend is a React/TypeScript SPA built with Vite.

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

### Client Setup (Node 24.14)
```bash
cd client
npm install
```

### Run the Client Dev Server
```bash
cd client
npm run dev       # Vite dev server — http://localhost:5173
```

### Client Build
```bash
cd client
npm run build     # Production build to client/dist/
npm run preview   # Preview the production build locally
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

## Client Architecture

The client is a React 19 + TypeScript 6 SPA. Key tech: Vite 8, React Router 7, TanStack Query 5, TanStack Form 1, Zod, Tailwind CSS 3, shadcn-style UI components.

```
client/src/
├── components/        # Reusable components
│   ├── PageTransition.tsx   # Animated route wrapper
│   └── ui/            # shadcn-style primitives (Button, Input, Badge, Label)
├── lib/
│   └── utils.ts       # cn() — merges Tailwind classes via clsx + tailwind-merge
├── pages/
│   └── auth/          # Auth flow: LandingPage, RoleSelect, Login, SignUp, SetPassword
├── styles/
│   └── variables.css  # CSS custom properties (colors, spacing, fonts, shadows)
├── types/
│   └── index.ts       # Shared TypeScript interfaces
├── App.tsx            # Router definition + AnimatedRoutes
└── main.tsx           # Entry point — mounts React Query QueryClientProvider
```

### Routing

Routes are defined in `App.tsx` via `AnimatedRoutes` (wraps each route with `PageTransition` for fade+slide transitions):

| Path | Component | Notes |
|---|---|---|
| `/` | LandingPage | Image carousel, CTA |
| `/role-select` | RoleSelect | Patient / Therapist / Trainer picker |
| `/login` | Login | Email or phone + password |
| `/signup` | SignUp | Receives `role` via `location.state` |
| `/set-password` | SetPassword | Password reset |
| `*` | — | Redirects to `/` |

### State Management

| Concern | Tool |
|---|---|
| Server/API state | `@tanstack/react-query` (`useMutation`, `useQuery`) |
| Form state | `@tanstack/react-form` |
| Local UI state | `useState` |
| Navigation state | React Router (`useNavigate`, `useLocation`) |

### Form Handling Pattern

Use `@tanstack/react-form` with the `zodValidator()` adapter:

```typescript
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

const form = useForm({
  defaultValues: { email: '', password: '' },
  validatorAdapter: zodValidator(),
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => { /* call mutation */ },
})

// In JSX — render-prop pattern:
<form.Field name="email">
  {(field) => (
    <>
      <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
      {field.state.meta.errors[0] && <p>{field.state.meta.errors[0]}</p>}
    </>
  )}
</form.Field>
```

### API Integration Pattern

Never call `useMutation` or `useQuery` directly inside a component. Always wrap each API interaction in a dedicated custom hook. Use **axios** for all HTTP calls (not `fetch`):

```typescript
// hooks/useLoginMutation.ts
export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      axios.post('/api/auth/login', data).then((res) => res.data),
  })
}

// Inside the component:
const loginMutation = useLoginMutation()
// onSuccess/navigate logic stays in the component
```

Disable the submit button during inflight: `disabled={loginMutation.isPending}`.

Current auth calls have `// TODO` comments — API is not yet connected.

### UI Components

`src/components/ui/` holds shadcn-style primitives:
- **Button** — CVA variants (`default`, `outline`, `ghost`, `link`) and sizes (`default`, `sm`, `lg`, `icon`). Uses `@radix-ui/react-slot` for the `asChild` prop.
- **Input** — Forwarded ref, Tailwind-styled.
- **Badge** — CVA variants for role labels.
- **Label** — Wraps `@radix-ui/react-label` for accessibility.

Always use `cn()` from `@/lib/utils` when merging Tailwind classes.

## Client Code Style

- **Imports**: Use the `@/` alias (maps to `src/`). Group: React → third-party → `@/` local → relative. Use `import type` for type-only imports.
- **Components**: PascalCase filename and function name; `export default` functional components. Co-locate a `.css` file alongside the component for page-level styles.
- **CSS**: BEM naming for component-level classes (`.auth-layout`, `.auth-panel__logo`). Use CSS custom properties from `variables.css` (`var(--color-primary)`) rather than hardcoded values. Use Tailwind for inline utility styling inside JSX.
- **TypeScript**: Strict mode enabled. Centralize shared interfaces in `src/types/index.ts`. Extend HTML element interfaces for primitive components (e.g., `ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`).
- **Naming**: Components — PascalCase; utilities — camelCase; CSS classes — BEM kebab-case; types/interfaces — PascalCase with descriptive suffix (`LoginRequest`, `RoleOption`).

## Code Style

Full rules in [server/docs/instructions/CODE_STYLE.md](server/docs/instructions/CODE_STYLE.md). Key rules:

- **Imports**: top-level only, never inside functions; group stdlib / third-party / local with blank lines; absolute imports only
- **Type hints**: required on all function signatures; use `T | None` not `Optional[T]`; lowercase builtins (`dict`, `list`, `set`); always annotate return type (including `-> None`)
- **Docstrings**: Google Style with `Args:`, `Returns:`, `Raises:` sections

## Testing

Full rules in [server/docs/instructions/TESTING_GUIDELINES.md](server/docs/instructions/TESTING_GUIDELINES.md). Key rules:

- Inherit from `unittest.TestCase`; run with `pytest`
- Test files: `test_*.py` | Test classes: `*Test` | Test methods: `test_*`
- Every test docstring uses **Given/When/Then**
- Every test body uses `# PREPARE / # MOCK / # ACT / # ASSERT` section comments
- Mocking: use `mockito` exclusively with `expect(..., times=N)`. Never use `unittest.mock` (no `patch`, `Mock`, `MagicMock`). Never use `when()` or `verify()`.
- Do not call `mockito.unstub()` in tearDown — pytest-mockito handles cleanup automatically
- Match mock parameter style (positional vs named) to the actual call site

## Pylint (Backend)

After every code change under `server/`, run pylint and fix all errors before considering the task done:

```bash
cd server && .venv/Scripts/pylint app
```

Repeat the cycle — run pylint, fix errors, run again — until the score is **10.00/10**. Do not stop at a partial score.

- The `.pylintrc` config is at `server/.pylintrc`
- Always run from the `server/` directory so `init-hook` resolves imports correctly

## Instruction Index

- Backend structure: [server/docs/dev/FASTAPI_PROJECT_GUIDE.md](server/docs/dev/FASTAPI_PROJECT_GUIDE.md)
- Backend setup: [server/docs/dev/PROJECT_INITIALIZATION_GUIDE.md](server/docs/dev/PROJECT_INITIALIZATION_GUIDE.md)
- Code style: [server/docs/instructions/CODE_STYLE.md](server/docs/instructions/CODE_STYLE.md)
- Testing: [server/docs/instructions/TESTING_GUIDELINES.md](server/docs/instructions/TESTING_GUIDELINES.md)
- Frontend style: [client/docs/instructions/FRONTEND_CODING_STYLE.md](client/docs/instructions/FRONTEND_CODING_STYLE.md)
- When editing under `server/` (excluding any future `client/`): follow backend instructions
- When editing under `client/`: follow the **Client Architecture** and **Client Code Style** sections above, and `FRONTEND_CODING_STYLE.md` for detailed rules
