# Rehab360

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![Node](https://img.shields.io/badge/Node-24.14-green?logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)

A web-based rehabilitation management platform that connects patients, physiotherapists, and fitness trainers in a single, unified system.

---

## Table of Contents

1. [Project Description](#project-description)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Key Features](#key-features)
5. [System Architecture](#system-architecture)
6. [Technology Stack](#technology-stack)
7. [User Roles and Permissions](#user-roles-and-permissions)
8. [Main System Workflows](#main-system-workflows)
9. [Database Overview](#database-overview)
10. [Installation](#installation)
11. [Running Locally](#running-locally)
12. [Project Structure](#project-structure)
13. [Future Enhancements](#future-enhancements)
14. [Screenshots](#screenshots)
15. [Authors](#authors)
16. [License](#license)

---

## Project Description

Rehab360 is a full-stack rehabilitation management web application that centralizes the rehabilitation process for three types of stakeholders: **Patients**, **Physiotherapists**, and **Rehabilitation Fitness Trainers**.

The platform enables professionals to document visits, create and manage personalized treatment and fitness plans, monitor patient adherence, and collaborate around a shared patient record. Patients use the platform to report on their assigned exercises, view their plans and visit history, schedule exercise reminders, and search for rehabilitation-related information using an AI-powered assistant.

---

## Problem Statement

Rehabilitation processes typically involve multiple professionals — physiotherapists, fitness trainers, and other specialists — working in parallel on the same patient. Without a unified platform, key information such as visit summaries, treatment plans, exercise progress, and pain reports is scattered across separate systems, paper records, or informal communication channels. This fragmentation makes it difficult for professionals to maintain a complete picture of a patient's rehabilitation journey, monitor adherence effectively, or coordinate care decisions in real time.

---

## Solution Overview

Rehab360 consolidates all rehabilitation activities into one platform accessible to all parties:

- **Patients** report on exercises, view their active plans, track progress, and access AI-generated rehabilitation content.
- **Physiotherapists** document visit summaries, create treatment plans with specific exercises, and monitor patient alerts and progress.
- **Fitness Trainers** document visit summaries, create fitness training plans, and monitor their patients.

All professionals involved in a patient's care have shared visibility into the patient's rehabilitation history, enabling better-coordinated and data-driven decisions.

---

## Key Features

- **Role-based authentication** — Separate registration and login flows for Patients, Physiotherapists, and Fitness Trainers
- **Visit summary management** — Professionals create and view structured session records (date, visit type, treatment area, diagnosis, recommendations)
- **Treatment plans** — Physiotherapists create personalized exercise plans with sets, reps, weight, duration, and goals
- **Fitness plans** — Fitness Trainers create training plans with the same exercise management capabilities
- **Exercise library** — A curated library of exercises filterable by difficulty, treatment area, and visit type
- **Exercise reporting** — Patients report execution status, pain level (1–10), effort level (1–10), and notes per exercise
- **Weekly schedule management** — Patients build their weekly exercise schedule and enable per-exercise reminders
- **Google Calendar integration** — Patients can export scheduled exercises as pre-filled Google Calendar events (URL-based, no OAuth required)
- **Progress tracking** — Professionals view patient adherence, pain trends, and exercise completion history
- **Patient details page** — A unified view of a patient's basic info, current plans, latest visit summary, and rehabilitation history visible to assigned professionals
- **AI-powered search assistant** — Users submit natural language queries and receive rehabilitation-related information via the Google Gemini AI API
- **Saved content** — Users can save, unsave, and filter AI search results
- **Professional content verification** — Physiotherapists and Fitness Trainers can mark AI-generated content as verified; verified content is highlighted with a badge
- **Query history** — Users can review and delete past AI search queries
- **Profile page** — Users can view their personal information and activity

---

## System Architecture

Rehab360 follows a client-server architecture with a strict layered backend:

```
┌─────────────────────────────────────────────────────────────┐
│                     React SPA (Client)                       │
│  Pages → Custom Hooks → Axios API Client → REST Endpoints   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / JSON (REST)
┌──────────────────────────▼──────────────────────────────────┐
│                  FastAPI Application (Server)                 │
│                                                              │
│   api/ (route handlers)                                      │
│      ↓                                                       │
│   services/ (business logic)                                 │
│      ↓                                                       │
│   dal/ (raw SQL — no ORM)                                    │
│      ↓                                                       │
│   db/ (aiomysql async connection pool)                       │
│                                                              │
│   models/ (Pydantic schemas — shared by api/ and services/) │
│   core/  (config, password hashing)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    MySQL Database (rehab360)                  │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- No ORM — all database interaction uses raw SQL via aiomysql
- `dal/` and `models/` are siblings of `api/` so non-HTTP code (tests, scripts) can reuse them without importing HTTP concerns
- Each API interaction on the frontend is encapsulated in a dedicated custom hook (no direct `useQuery`/`useMutation` calls in page components)

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI framework |
| TypeScript | 6.0.2 | Static typing |
| Vite | 8.x | Build tool and dev server |
| React Router DOM | 7.13.2 | Client-side routing |
| TanStack Query | 5.95.2 | Server state and data fetching |
| TanStack Form | 1.28.5 | Form state management |
| Jotai | 2.19.1 | Global client state (atoms) |
| Axios | 1.14.0 | HTTP client |
| Zod | 3.25.76 | Schema validation |
| Tailwind CSS | 3.4.19 | Utility-first styling |
| Radix UI | Various | Accessible UI primitives |
| Lucide React | 1.7.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | ≥ 0.115.0 | Web framework |
| Uvicorn | ≥ 0.30.0 | ASGI server |
| Pydantic | ≥ 2.9.0 | Data validation and models |
| pydantic-settings | ≥ 2.5.0 | Environment configuration |
| aiomysql | ≥ 0.2.0 | Async MySQL driver |
| pwdlib (bcrypt/argon2) | ≥ 0.3.0 | Password hashing |
| google-genai | latest | Google Gemini AI API client |
| pytest + pytest-asyncio | ≥ 8.0.0 | Unit testing |
| Playwright | latest | End-to-end testing |

### Database

| Technology | Purpose |
|---|---|
| MySQL | Primary relational database (`rehab360`) |

---

## User Roles and Permissions

| Capability | Patient | Physiotherapist | Fitness Trainer |
|---|:---:|:---:|:---:|
| Register and log in | ✓ | ✓ | ✓ |
| View own profile | ✓ | ✓ | ✓ |
| View assigned treatment/fitness plan | ✓ | — | — |
| Report exercise execution | ✓ | — | — |
| Build weekly exercise schedule | ✓ | — | — |
| Export exercises to Google Calendar | ✓ | — | — |
| View own visit summaries | ✓ | — | — |
| View own rehabilitation history | ✓ | — | — |
| Use AI search assistant | ✓ | ✓ | ✓ |
| Save and manage AI content | ✓ | ✓ | ✓ |
| Verify AI content (professional badge) | — | ✓ | ✓ |
| View patient list and dashboard | — | ✓ | ✓ |
| View patient details and history | — | ✓ | ✓ |
| Create visit summaries | — | ✓ | ✓ |
| Create treatment plans | — | ✓ | — |
| Create fitness plans | — | — | ✓ |

---

## Main System Workflows

### Process 1 — Exercise Performance Reporting

1. A professional creates a plan (treatment or fitness) for a patient, assigning exercises with sets, reps, weight, and duration.
2. The patient views their active plan and builds a weekly schedule, assigning each exercise to specific days and optionally enabling reminders.
3. Patients can export scheduled exercises as Google Calendar events (URL-based, opens a pre-filled calendar form in a new browser tab).
4. Patients report on each exercise: execution status (completed/skipped), pain level, effort level, and optional notes.
5. Professionals monitor adherence, pain trends, and completion data from the patient details page.

### Process 2 — AI-Powered Professional Search

1. Any user submits a natural language query on the AI search page.
2. The query is sent to the backend, which calls the Google Gemini AI API and returns a structured response with sources.
3. Users can follow up with additional questions in the same conversation session.
4. Users can save individual content items from the results for later reference.
5. Physiotherapists and Fitness Trainers can mark saved content as professionally verified; a verification badge is displayed on verified items.
6. Users can view and delete their query history.

### Process 3 — Visit Summaries and Treatment/Fitness Plans

1. After a patient visit, the professional creates a visit summary documenting the date, visit type, treatment area, diagnosis, description, and recommendations.
2. From the same session, the professional can create a treatment plan (Physiotherapist) or fitness plan (Fitness Trainer) with specific exercises, goals, dates, and notes.
3. Both the patient and the professionals involved can view visit summaries and plan details.
4. The patient details page shows a unified rehabilitation history including all past sessions and current plans.

---

## Database Overview

The `rehab360` MySQL database contains 11 tables:

| Table | Description |
|---|---|
| `registered_users` | Core user table with roles (`PATIENT`, `PHYSIOTHERAPIST`, `FITNESS_TRAINER`), contact info, and hashed passwords |
| `exercises` | Exercise library with name, difficulty level, treatment area, video URL, text instructions, and visit type |
| `sessions` | Visit records linking a patient to a therapist, including date, time, visit type, diagnosis, and recommendations |
| `plans` | Treatment or fitness plans linked to a session, with goal, start/end dates, and notes |
| `plan_exercises` | Exercises assigned within a plan, with per-exercise reps, sets, weight, duration, and description |
| `weekly_plans` | Patient's schedule mapping plan exercises to specific dates, with optional reminder time and notification toggle |
| `exercise_completion` | Patient execution reports per scheduled exercise: status, pain level, effort level, and notes |
| `queries` | AI search queries submitted by users, with query text and timestamp |
| `content` | Content items returned by the AI (title, type, source URL, text), linked to a query |
| `saved_content` | Records of users bookmarking content items |
| `url_verifications` | Aggregated verification counts (physiotherapist and trainer) per content source URL |

> The schema and seed data are located in `db/init.sql`. Users use a composite primary key `(user_id, user_role)` across the system.

---

## Installation

### Prerequisites

- Python 3.11 or higher
- Node.js 24.14
- MySQL server with a database named `rehab360` created
- A Google Gemini API key (required for the AI search feature)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Rehab360
```

### 2. Initialize the Database

Import the schema and seed data into your MySQL instance:

```bash
mysql -u <your_user> -p rehab360 < db/init.sql
```

### 3. Backend Setup

```bash
cd server

# Create and activate a virtual environment
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Create a `.env` file inside the `server/` directory:

```env
DB_HOST=localhost
DB_USER=<your_mysql_user>
DB_PASSWORD=<your_mysql_password>
DB_NAME=rehab360
GEMINI_API_KEY=<your_gemini_api_key>
```

### 4. Frontend Setup

```bash
cd client
npm install
```

---

## Running Locally

### Start the Backend

```bash
cd server
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive API docs (Swagger UI): `http://localhost:8000/docs`

### Start the Frontend

```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

> Both servers must be running simultaneously for the application to function correctly.

### Run Backend Tests

```bash
cd server
source .venv/bin/activate
pytest tests/unit/ -v          # Unit tests only
pytest                          # All tests (unit + E2E)
```

---

## Project Structure

```
Rehab360/
│
├── client/                          # React/TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                  # Router definition and role-based route guards
│   │   ├── main.tsx                 # Entry point (React Query + Jotai providers)
│   │   ├── components/              # Shared UI components (TopNav, PageTransition, etc.)
│   │   │   └── ui/                  # Primitive components (Button, Input, Badge, etc.)
│   │   ├── hooks/                   # Custom data-fetching and mutation hooks (one per API action)
│   │   ├── pages/
│   │   │   ├── auth/                # Landing, RoleSelect, Login, SignUp, SetPassword
│   │   │   ├── patient/             # Patient home, plan view, exercise report, schedule
│   │   │   ├── physiotherapist/     # Physiotherapist home
│   │   │   ├── patient-details/     # Unified patient details page (for professionals)
│   │   │   ├── ai-search/           # AI search page and saved content page
│   │   │   ├── create-visit-summary/
│   │   │   ├── visit-summary-detail/
│   │   │   ├── all-visit-summaries/
│   │   │   ├── create-treatment-plan/
│   │   │   ├── view-treatment-plan/
│   │   │   └── profile/
│   │   ├── store/                   # Jotai atoms (authAtom, aiSearchAtom, unsavedChangesAtom)
│   │   ├── types/                   # Shared TypeScript interfaces (index.ts, exercise.ts, patient.ts)
│   │   ├── lib/                     # Axios client instance and utility functions
│   │   └── styles/                  # CSS custom properties (variables.css)
│   ├── package.json
│   └── vite.config.ts               # Vite config with @/ path alias
│
├── server/                          # FastAPI backend
│   ├── app/
│   │   ├── main.py                  # FastAPI app setup, CORS middleware, router registration
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings — loads all env vars
│   │   │   └── security.py          # Password hashing and verification
│   │   ├── db/
│   │   │   └── session.py           # aiomysql connection pool and get_db() dependency
│   │   ├── api/                     # Route handlers (HTTP layer only — no business logic)
│   │   ├── services/                # Business logic layer
│   │   ├── dal/                     # Raw SQL data access layer (one module per resource)
│   │   └── models/                  # Pydantic request/response schemas
│   ├── tests/
│   │   ├── unit/                    # Unit tests (api/, services/, dal/, core/)
│   │   └── e2e/                     # Playwright end-to-end tests
│   ├── docs/                        # Architecture guides and coding standards
│   └── requirements.txt
│
├── db/
│   └── init.sql                     # Database schema (CREATE TABLE) and seed data
│
├── docs/                            # Project-level documentation
├── GOOGLE_CALENDAR_INTEGRATION.md   # Details of the URL-based Google Calendar feature
├── LICENSE
└── README.md
```

### API Route Prefixes

| Prefix | Responsibility |
|---|---|
| `/users` | Authentication — login and registration |
| `/patient` | Patient-specific data and operations |
| `/profile` | User profile retrieval |
| `/visit-summary` | Visit summary CRUD |
| `/exercise` | Exercise library queries |
| `/treatment-plan` | Treatment and fitness plan CRUD |
| `/ai-search` | Gemini AI queries, saved content, content verification |
| `/home` | Dashboard data for patient and professional homepages |
| `/patient-details` | Unified patient details for professionals |

---

## Future Enhancements

- **In-app messaging** — Direct chat between patients and their assigned professionals is a planned feature that was out of scope for the current MVP.

<!-- TODO: Additional roadmap items to be defined by the project team -->

---

## Screenshots

<!-- TODO: Add screenshots of key pages -->
<!-- Suggested pages: Landing Page, Patient Home, AI Search, Visit Summary Detail, Create Treatment Plan -->

---

## Authors

<!-- TODO: Add team member names, student IDs, and institutional affiliation -->

---

## License

This project is licensed under the **Apache License 2.0**.  
See the [LICENSE](LICENSE) file for the full license text.
