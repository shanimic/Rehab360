# Rehab360 — Complete System Process Flow & Test Case Plan

## Overview

This document provides a full end-to-end analysis of the Rehab360 rehabilitation management platform. The system has three roles — **Patient**, **Physiotherapist**, and **Fitness Trainer** — and is built as a React 19 + TypeScript SPA (Vite) with a Python/FastAPI backend. All process flows were derived from source code exploration of hooks, pages, types, and routing.

---

# PART 1 — PROCESS FLOW TABLES

---

## Process 1 — User Login and Authentication

| Column | Detail |
|---|---|
| **Process Name** | User Login and Authentication |
| **Description** | Any user selects their role, enters credentials, and is authenticated into the system. Auth state is persisted to localStorage via a Jotai atom. |
| **User Role Responsible** | Patient / Physiotherapist / Fitness Trainer (all roles) |
| **Preconditions** | User has a registered account. User knows their email, password, and role. |
| **Main Flow Steps** | 1. User lands on `/` (Landing Page). 2. Clicks "Log In". 3. Navigated to `/role-select?action=login`. 4. Selects role (Patient / Physiotherapist / Fitness Trainer). 5. Navigated to `/login?role={role}`. 6. Enters email and password. 7. Submits form → `POST /users/login`. 8. On success: `authAtom` set with `LoginResponse`; user redirected to role home. |
| **Expected System Response** | Auth token and user data stored. Redirect: Patient → `/patient`, Physiotherapist → `/physiotherapist/home`, Fitness Trainer → `/fitness/home`. |
| **Related Screens/Pages** | `LandingPage.tsx`, `RoleSelect.tsx`, `Login.tsx` |

---

## Process 2 — User Registration

| Column | Detail |
|---|---|
| **Process Name** | User Registration |
| **Description** | A new user creates an account by selecting a role and filling registration details. Professionals may include a license number. |
| **User Role Responsible** | Patient / Physiotherapist / Fitness Trainer (self-registration) |
| **Preconditions** | User does not have an existing account. |
| **Main Flow Steps** | 1. User clicks "Sign Up" on Landing Page. 2. Navigated to `/role-select?action=signup`. 3. Selects role. 4. Navigated to `/signup`. 5. Fills: first name, last name, email, password, phone, birth date (and license number if professional). 6. Submits → `POST /users/register`. 7. On success: redirect to `/login` or auto-login. |
| **Expected System Response** | Account created. User redirected to login page with confirmation. |
| **Related Screens/Pages** | `LandingPage.tsx`, `RoleSelect.tsx`, `SignUp.tsx`, `SetPassword.tsx` |

---

## Process 3 — Patient Viewing and Progress Tracking Flow

| Column | Detail |
|---|---|
| **Process Name** | Patient Viewing and Progress Tracking Flow |
| **Description** | All read-only VIEW actions available to an authenticated patient, covering the home dashboard, today's exercise plan, rehabilitation progress, visit summaries, and both the treatment plan and fitness plan detail views. |
| **User Role Responsible** | Patient |
| **Preconditions** | Patient is logged in. |
| **Main Flow Steps** | **Home Dashboard:** 1. Patient navigates to `/patient`. 2. App calls `GET /patient/home/{patient_id}`. 3. Dashboard renders: daily exercises, weekly completion %, physiotherapy progress %, fitness progress %, daily completion count. **Today's Plan:** 4. Patient navigates to `/patient/my-plan`. 5. App calls `GET /exercise/{patient_id}`. 6. Today's and tomorrow's exercises shown (name, reps, sets, completion status). 7. Patient expands "View All" → `GET /exercise/{patient_id}/weekly` → full 7-day view. **Rehabilitation Progress:** 8. Patient navigates to `/patient/my-process`. 9. App calls `GET /patient-details/{patient_id}?viewer_role=patient`. 10. Basic info, latest visit, treatment plan progress %, fitness plan progress % shown. **Visit Summaries:** 11. Patient navigates to `/patient/visit-summaries`. 12. App calls `GET /visit-summary/sessions/{patient_id}`. 13. Chronological list displayed (date, therapist, treatment area, diagnosis). 14. Patient clicks a session → `/patient/visit-summaries/:visitId` → `GET /visit-summary/{session_id}` → full detail with linked plan. **Treatment Plan View:** 15. Patient clicks treatment plan link from My Process or Visit Summary detail. 16. App calls `GET /treatment-plan/plan/{plan_id}`. 17. Full plan shown: goal, dates, exercises, per-exercise patient reports (date, status, pain, effort). **Fitness Plan View:** 18. Patient clicks "Go to Current Fitness Plan" button (existing UI — no new button required). 19. App calls `GET /treatment-plan/plan/{plan_id}` (fitness plan context). 20. Fitness plan displayed: goal, dates, exercises, progress %. |
| **Expected System Response** | Each view loads the relevant data from the API. Empty states shown gracefully when no plan or sessions exist. Completed exercises are visually differentiated. Progress percentages are calculated from completed vs total reports. |
| **Related Screens/Pages** | `PatientHome.tsx`, `MyPlan.tsx`, `PatientDetails.tsx`, `ViewTreatmentPlan.tsx`, `AllVisitSummaries.tsx`, `VisitSummaryDetail.tsx` |

---

## Process 4 — Exercise Reporting Flow

| Column | Detail |
|---|---|
| **Process Name** | Exercise Reporting Flow |
| **Description** | Patient selects an exercise from the daily plan and reports either completion (with pain and effort levels) or non-completion (with a mandatory reason). Covers both reporting scenarios in a single branching flow. |
| **User Role Responsible** | Patient |
| **Preconditions** | Patient is logged in. Exercise exists in today's plan and has not been reported today. |
| **Main Flow Steps** | 1. Patient clicks an exercise in My Plan → `/patient/exercise/:id`. 2. App calls `GET /exercise/{exercise_id}/{patient_id}`. 3. Patient views exercise details (video embed, instructions). 4. Patient selects outcome: **Completed** or **Not Completed**. **If Completed:** 5a. Patient sets pain level (0–10 slider). 6a. Patient sets effort level (0–10 slider). 7a. Patient optionally enters notes / change request. 8a. Patient submits → `POST /exercise/{exercise_id}/{patient_id}` with `execution_status: true`. **If Not Completed:** 5b. Reason textarea becomes visible and required. 6b. Patient fills in reason for non-performance. 7b. Patient optionally fills "Request for Change". 8b. Patient submits → `POST /exercise/{exercise_id}/{patient_id}` with `execution_status: false`. **Both paths:** 9. System saves the report. 10. Exercise marked with completion status. 11. Progress percentages updated. 12. Data becomes visible to assigned professionals. 13. Patient redirected to My Plan. |
| **Expected System Response** | Report saved. Exercise status updated in the plan. Home dashboard stats reflect the new report. Professional can see the report (including any reason for non-completion) in the treatment/fitness plan detail view. |
| **Related Screens/Pages** | `ExerciseReport.tsx`, `MyPlan.tsx` |

---

## Process 5 — Creating Exercise Reminders / Scheduling

| Column | Detail |
|---|---|
| **Process Name** | Creating Exercise Reminders / Scheduling |
| **Description** | Patient plans their weekly exercise schedule by assigning exercises to days, setting reminder times, and optionally syncing to Google Calendar. |
| **User Role Responsible** | Patient |
| **Preconditions** | Patient is logged in. At least one active plan with exercises exists. |
| **Main Flow Steps** | 1. Patient navigates to `/patient/schedule-exercise`. 2. App calls `GET /patient/weekly-schedule/{patient_id}`. 3. Available exercises displayed in pool. 4. Patient drags/selects exercises into day slots (Sunday–Saturday grid). 5. Patient sets reminder date/time per exercise per day. 6. Patient submits → `POST /patient/weekly-schedule/{patient_id}`. 7. If reminders enabled: `buildCalendarUrl()` generates Google Calendar links. |
| **Expected System Response** | Weekly schedule saved. Google Calendar reminder links generated for exercises with reminders. Unscheduled exercises trigger a confirmation modal. |
| **Related Screens/Pages** | `ExerciseSchedule.tsx` |

---

## Process 6 — AI Medical Knowledge Search

| Column | Detail |
|---|---|
| **Process Name** | Searching Medical Knowledge using AI Search |
| **Description** | Any authenticated user submits a natural-language query about rehabilitation topics. The system uses Google Gemini to return a summary and curated sources. Multi-turn conversation is supported. |
| **User Role Responsible** | Patient / Physiotherapist / Fitness Trainer |
| **Preconditions** | User is logged in. |
| **Main Flow Steps** | 1. User navigates to `/ai-search`. 2. User types query or clicks a suggested topic chip. 3. Selects search mode: "instant" or "thinking". 4. Submits → `POST /ai-search/queries`. 5. Gemini returns `summary` + `sources[]`. 6. User can ask follow-up (conversation history maintained). 7. User can click "New Chat" to reset. |
| **Expected System Response** | AI-generated summary displayed. Sources listed (sorted by verification count). Multi-turn Q&A supported via `conversation_history` parameter. |
| **Related Screens/Pages** | `AiSearchPage.tsx` |

---

## Process 7 — Saving Medical Content to Favorites

| Column | Detail |
|---|---|
| **Process Name** | Saving Medical Content to Favorites |
| **Description** | After an AI search, any user can save a source to their personal library. Professionals can additionally mark content as "verified." |
| **User Role Responsible** | Patient / Physiotherapist / Fitness Trainer (save); Physiotherapist / Fitness Trainer (verify) |
| **Preconditions** | User is logged in. An AI search result with sources is displayed. |
| **Main Flow Steps** | 1. User performs AI search (see Process 6). 2. User clicks Save on a source → `POST /ai-search/saved-content`. 3. User navigates to `/ai-search/saved` → `GET /ai-search/saved-content/{user_id}`. 4. **Professional only:** Clicks "Verify" on a saved source → `POST /ai-search/verified-content`. 5. User can remove content → `DELETE /ai-search/saved-content/{saving_id}`. |
| **Expected System Response** | Content appears in Saved Content page. Verified content shows higher verification counts and is prioritized in listings. Professionals' verifications are tracked separately (physio_count vs trainer_count). |
| **Related Screens/Pages** | `AiSearchPage.tsx`, `SavedContentPage.tsx` |

---

## Process 8 — Professional Verified AI Content Flow

| Column | Detail |
|---|---|
| **Process Name** | Professional Verified AI Content Flow |
| **Description** | A Physiotherapist or Fitness Trainer searches for medical content using AI, reviews the results, and formally verifies sources. Verified content is stored with a verification indicator and is prioritised for future users. |
| **User Role Responsible** | Physiotherapist / Fitness Trainer |
| **Preconditions** | Professional is logged in. |
| **Main Flow Steps** | 1. Professional navigates to `/ai-search`. 2. Professional types a query and submits → `POST /ai-search/queries`. 3. Gemini returns `summary` + `sources[]`. 4. Professional reviews the AI-generated results and sources. 5. Professional clicks Save on a relevant source → `POST /ai-search/saved-content`. 6. Professional navigates to Saved Content (`/ai-search/saved`) → `GET /ai-search/saved-content/{user_id}`. 7. Professional clicks "Verify" on a saved source → `POST /ai-search/verified-content`. 8. System saves verification status; verified content displays a verification indicator (badge/icon). 9. Verified content is prioritised in future search result listings, sorted by `physio_verification_count` or `trainer_verification_count`. |
| **Expected System Response** | Verification saved. Verified source displays a visual verification indicator. Verification counts (`physio_verification_count`, `trainer_verification_count`) increment. Verified content appears ranked higher in future listings. Patient role cannot trigger the Verify action — the button is not visible to patients. |
| **Related Screens/Pages** | `AiSearchPage.tsx`, `SavedContentPage.tsx` |

---

## Process 9 — Viewing Patient Profile (Professional)

| Column | Detail |
|---|---|
| **Process Name** | Viewing Patient Profile (Professional) |
| **Description** | A Physiotherapist or Fitness Trainer views a patient's full profile, including personal information, progress summary, visit history, and both treatment and fitness plan details. All viewing actions for a patient are accessible from Patient Details. |
| **User Role Responsible** | Physiotherapist / Fitness Trainer |
| **Preconditions** | Professional is logged in. Patient exists in the system. |
| **Main Flow Steps** | 1. Professional clicks a patient card on Home Dashboard → `/physiotherapist/patient/:patientId` or `/fitness/patient/:patientId`. 2. App calls `GET /patient-details/{patient_id}?viewer_role={role}`. 3. **Profile card** displayed: name, phone, email, age, birth date. 4. **Progress summary** displayed: treatment plan progress %, fitness plan progress %, latest visit (date, therapist, type). 5. **View Visit Summaries:** Professional clicks Visit Summaries link → `GET /visit-summary/sessions/{patient_id}` → chronological list. Professional opens any session → `GET /visit-summary/{session_id}` → full detail including linked plan. 6. **View Treatment Plan:** Professional clicks Treatment Plan link → `GET /treatment-plan/plan/{plan_id}` (physiotherapy context) → full plan: goal, dates, exercises, per-exercise patient reports (date, status, pain, effort). 7. **View Fitness Plan:** Professional clicks Fitness Plan link → `GET /treatment-plan/plan/{plan_id}` (fitness context) → full fitness plan with exercises and per-exercise reports. |
| **Expected System Response** | Full patient profile rendered. All three navigation links (Visit Summaries, Treatment Plan, Fitness Plan) are accessible from Patient Details. Each sub-view loads the relevant data. Empty/null states shown gracefully when no plan or visits exist. |
| **Related Screens/Pages** | `PatientDetails.tsx`, `ViewTreatmentPlan.tsx`, `AllVisitSummaries.tsx`, `VisitSummaryDetail.tsx`, `HomePage.tsx` |

---

## Process 10 — Creating Visit Summary and Treatment/Fitness Plan

| Column | Detail |
|---|---|
| **Process Name** | Creating Visit Summary and Treatment/Fitness Plan |
| **Description** | A Physiotherapist or Fitness Trainer creates a clinical visit summary for a patient and immediately follows through to create or update the associated treatment or fitness plan with specific exercises. |
| **User Role Responsible** | Physiotherapist / Fitness Trainer |
| **Preconditions** | Professional is logged in. Patient exists in the system. |
| **Main Flow Steps** | 1. Professional clicks "New Visit Summary" on Home Dashboard. 2. Selects patient from "All Patients" modal (`GET /home/all-patients`). 3. Navigated to `/physiotherapist/patient/:id/visit-summaries/new`. 4. App calls `GET /visit-summary/patient/{patient_id}` + `GET /visit-summary/has-previous-plan/{patient_id}`. 5. Professional fills: visit date/time, treatment area, medical diagnosis (required), description (required), recommendations (optional). 6. Optionally checks "Copy previous plan". 7. Submits → `POST /visit-summary`. 8. System saves summary; returns `session_id`; professional navigated to Create Treatment/Fitness Plan page. 9. App calls `GET /treatment-plan/context/{session_id}` (diagnosis, visit type) + `GET /treatment-plan/exercises?visit_type={type}` (available exercises). 10. Professional fills: goal (required), start date, end date (must be > start), notes (optional). 11. Opens exercise selector modal; selects exercises; sets reps, sets, weight, duration, unit, description per exercise (min 1 required). 12. Submits → `POST /treatment-plan/{session_id}`. 13. System saves plan. Patient's daily exercise list updated. Progress tracking begins. Professional redirected to visit summaries list. |
| **Expected System Response** | Visit summary saved and linked to session. Plan saved with all exercises. Patient's `GET /patient/home/{id}` begins returning new exercises. Plan appears in Patient Details with 0% initial progress. |
| **Related Screens/Pages** | `HomePage.tsx`, `CreateVisitSummary.tsx`, `CreateTreatmentPlan.tsx`, `AllVisitSummaries.tsx` |

---

## Process 11 — Professional Dashboard View and Logout Flow

| Column | Detail |
|---|---|
| **Process Name** | Professional Dashboard View and Logout Flow |
| **Description** | Professional's home page showing the patient roster with progress data, priority alerts, and today's appointment schedule. Includes the logout action that clears all session state and returns the user to the landing page. |
| **User Role Responsible** | Physiotherapist / Fitness Trainer |
| **Preconditions** | Professional is logged in. |
| **Main Flow Steps** | 1. Professional navigates to `/physiotherapist/home` or `/fitness/home`. 2. App calls `GET /home/patients?therapist_id={id}&therapist_role={role}`. 3. Patient cards shown: name, diagnosis, progress %, last update. 4. Professional can search/filter patients. 5. Priority alerts displayed (pain_spike, inactivity, stuck, milestone, overexertion) — *currently mock data*. 6. Today's appointment schedule shown — *currently mock data*. 7. Professional clicks "Logout" in the TopNav sidebar. 8. `useLogout()` hook fires: clears `authAtom` → null, resets TanStack Query cache, clears other atoms. 9. User redirected to `/` (Landing Page). All protected routes inaccessible. |
| **Expected System Response** | Dashboard shows all assigned patients with current progress. Alerts flag patients needing attention. On logout: session cleared from localStorage, all cached data cleared, user sees Landing Page, protected routes redirect to `/login`. |
| **Related Screens/Pages** | `HomePage.tsx`, `TopNav.tsx`, `LandingPage.tsx` |

---

# PART 2 — DETAILED TEST CASES

**Legend:**

| Badge | Meaning |
|---|---|
| ✅ | Automated Playwright test implemented and passing |
| ✅ 🌱 | Implemented — requires a fresh DB seed to re-run (mutates data) |
| ✅ 🐢 | Implemented — makes a real Gemini API call (slow, ~10–60 s) |
| ⬜ | Not yet automated |

All automated tests live under `server/tests/e2e/`.

### Coverage summary

| Test Group | Implemented | Total Cases |
|---|---|---|
| TC-01 — Login & Auth | 13 / 14 | 1 case not automated (TC-01-V2) |
| TC-02 — Registration | 5 / 9 | Positive P3 + validations V1/V2/N3 pending |
| TC-03 — Patient Views | 11 / 19 | Integration and some edge cases pending |
| TC-04 — Exercise Reporting | 7 / 11 | Integration tests pending |
| TC-05 — Scheduling | 0 / 6 | Not yet automated |
| TC-06 — AI Search | 6 / 8 | TC-06-P2 (follow-up) and error cases pending |
| TC-07 — Save Content | 2 / 7 | Most positive + permission cases pending |
| TC-08 — Verified Content | 1 / 7 | Positive + negative cases pending |
| TC-09 — Professional Views | 8 / 12 | TC-09-P2, P8, N2, R2 pending |
| TC-10 — Create Visit/Plan | 7 / 14 | Integration + Trainer + copy-plan cases pending |
| TC-11 — Dashboard & Logout | 6 / 7 | Integration test pending |
| TC-17 — Cross-Role Routes | 5 / 5 | **Full coverage** |
| **Total** | **71 / 119** | **~60% automated** |

---

## TC-01: User Login and Authentication

**Test file:** `tests/e2e/test_login.py`

### Positive Cases

| ID | Title | Steps | Expected | Status |
|---|---|---|---|---|
| TC-01-P1 | Successful patient login | Enter valid email + password with Patient role | Redirected to `/patient`; `authAtom` has `role: PATIENT` | ✅ |
| TC-01-P2 | Successful physiotherapist login | Valid credentials with Physiotherapist role | Redirected to `/physiotherapist/home` | ✅ |
| TC-01-P3 | Successful fitness trainer login | Valid credentials with FITNESS_TRAINER role | Redirected to `/fitness/home` | ✅ |
| TC-01-P4 | Session persists on page refresh | Login, then refresh the page | User remains logged in; `authAtom` rehydrated from localStorage | ✅ |

### Negative Cases

| ID | Title | Steps | Expected | Status |
|---|---|---|---|---|
| TC-01-N1 | Wrong password | Enter correct email, wrong password | Error message shown; no redirect | ✅ |
| TC-01-N2 | Non-existent email | Enter email not in system | Error message shown | ✅ |
| TC-01-N3 | Wrong role selected | Enter physiotherapist credentials but select Patient role | API error / access denied | ✅ |
| TC-01-N4 | Empty email field | Submit form with blank email | Validation error on email field | ✅ |
| TC-01-N5 | Empty password field | Submit form with blank password | Validation error on password field | ✅ |

### Validation Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-01-V1 | Email format check | `invalid-email` rejected before API call | ✅ |
| TC-01-V2 | Role is required | Submit with no role selected → blocked | ⬜ |

### Permission / Role Tests

| ID | Title | Steps | Expected | Status |
|---|---|---|---|---|
| TC-01-R1 | Patient cannot access `/physiotherapist/home` | Navigate directly to physiotherapist home while logged in as patient | `RoleRoute` redirects to `/patient` | ✅ |
| TC-01-R2 | Unauthenticated user redirected to login | Navigate to `/patient` without auth | Redirected to `/` | ✅ |
| TC-01-R3 | Fitness trainer cannot access physiotherapist routes | Navigate to `/physiotherapist/home` as trainer | `RoleRoute` redirects to `/fitness/home` | ✅ |

---

## TC-02: User Registration

**Test file:** `tests/e2e/test_tc02_registration.py`

### Positive Cases

| ID | Title | Steps | Expected | Status |
|---|---|---|---|---|
| TC-02-P1 | Patient registration with all fields | Fill all required fields, submit | Account created; redirected away from `/signup` | ✅ 🌱 |
| TC-02-P2 | Physiotherapist registration with license number | Fill all fields including `license_number` | Account created | ✅ 🌱 |
| TC-02-P3 | Fitness Trainer registration | Select Fitness Trainer role, fill fields | Account created | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-02-N1 | Duplicate email | Error: "email already in use" | ✅ |
| TC-02-N2 | Missing required field (e.g., first_name) | Validation error on that field | ✅ |
| TC-02-N3 | Invalid birth date format | Validation error | ⬜ |
| TC-02-N4 | Password too short/weak | Validation error on password | ✅ |

### Validation Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-02-V1 | Phone number format | Invalid phone rejected | ⬜ |
| TC-02-V2 | Birth date in the future | Rejected with appropriate error | ⬜ |

---

## TC-03: Patient Viewing and Progress Tracking Flow

**Test file:** `tests/e2e/test_tc03_patient_views.py`

### Positive Cases — Home Dashboard

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-P1 | Dashboard loads with active plan | Daily exercises, weekly completion %, progress bars all displayed | ✅ |
| TC-03-P2 | Dashboard reflects completed exercises | `daily_completions.completed_sum` increments after reporting | ⬜ |
| TC-03-P3 | Progress bars show correct percentages | `fitness_percentage` and `physiotherapist_percentage` match backend calculation | ⬜ |

### Positive Cases — Today's Plan

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-P4 | Today's exercises load | List of exercises for today shown with name, reps, sets, status | ✅ |
| TC-03-P5 | Tomorrow's exercises shown | Next-day exercises visible below today's | ⬜ |
| TC-03-P6 | Expand to full week | "View All" triggers weekly API call; all 7 days shown | ✅ |
| TC-03-P7 | Completed exercises visually distinguished | Completed exercises have different styling | ✅ |

### Positive Cases — Rehabilitation Progress

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-P8 | Patient views own progress | `PatientDetails` shows both plan progress %; clicking a plan loads `ViewTreatmentPlan` | ✅ |
| TC-03-P9 | Plan with multiple exercises each with reports | Each exercise expandable; all historical reports listed | ⬜ |

### Positive Cases — Visit Summaries

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-P10 | Patient sees full list of sessions | Chronological list with date, therapist, type badge, diagnosis | ✅ |
| TC-03-P11 | Patient opens a session | Full detail: all fields shown; plan link if plan exists | ✅ |
| TC-03-P12 | Filter by visit type | "Physical Therapy" filter shows only PHYSIOTHERAPIST sessions | ✅ |

### Positive Cases — Treatment Plan and Fitness Plan Views

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-P13 | Patient views treatment plan detail | Goal, dates, exercise list, and per-exercise reports shown | ✅ |
| TC-03-P14 | Patient views fitness plan via "Go to Current Fitness Plan" button | Fitness plan goal, dates, exercises, progress % shown; no new UI required | ⬜ |
| TC-03-P15 | Plan with no reports shows 0% progress | Exercise list shown without reports; 0% progress displayed | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-N1 | No active plan | Empty state message shown; no crash | ⬜ |
| TC-03-N2 | No plan exists for progress view | Graceful empty state for both treatment and fitness plan sections | ⬜ |
| TC-03-N3 | No sessions exist for visit summaries | Empty state message shown | ✅ |
| TC-03-N4 | Invalid visitId in URL | 404 or error state | ⬜ |
| TC-03-N5 | API returns 500 | Error state displayed gracefully; no crash | ⬜ |

### Integration Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-I1 | Complete exercise → return to home → stats update | `GET /patient/home/{id}` refetched; numbers reflect new report | ⬜ |
| TC-03-I2 | Complete exercise → view treatment plan | Report appears in `patient_reports` for that exercise in `ViewTreatmentPlan` | ⬜ |

### Permission Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-03-R1 | Physiotherapist cannot access `/patient/my-plan` | Redirected to professional home | ✅ |
| TC-03-R2 | Patient sees only their own visit summaries | API scoped to `patient_id` from `authAtom` | ⬜ |
| TC-03-R3 | Patient cannot view another patient's progress | `RoleRoute` prevents access to `/physiotherapist/patient/:otherId` | ⬜ |

---

## TC-04: Exercise Reporting Flow

**Test file:** `tests/e2e/test_tc04_exercise_report.py`

### Positive Cases — Completion Branch

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-04-P1 | Report exercise as completed | `execution_status: true`, pain=3, effort=5 saved; exercise marked complete | ✅ 🌱 |
| TC-04-P2 | Report with pain level 0 | Accepted; no minimum pain required | ⬜ |
| TC-04-P3 | Report completed with optional change request | `request_for_change` saved alongside report | ⬜ |

### Positive Cases — Non-Completion Branch

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-04-P4 | Report not completed with reason | `execution_status: false`, reason saved; exercise shows non-completion | ✅ 🌱 |
| TC-04-P5 | Non-completion with change request | Both reason and change request saved | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-04-N1 | Submit without selecting completion status | Form blocked; Save button disabled | ✅ |
| TC-04-N2 | Select "Not Completed" but leave reason blank | Submit blocked; reason field shows required error | ✅ |
| TC-04-N3 | Reason is only whitespace | Treated as empty; submit blocked | ✅ |
| TC-04-N4 | API call fails (network error) | Error shown; report not recorded; user can retry | ⬜ |

### Validation Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-04-V1 | Pain level outside 0–10 | Slider enforces bounds; value clamped | ✅ |
| TC-04-V2 | Effort level outside 0–10 | Slider enforces bounds | ✅ |

### Integration Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-04-I1 | Complete exercise → check home dashboard | `daily_completions.completed_sum` incremented | ⬜ |
| TC-04-I2 | Report non-completion → professional views plan | Reason visible in `reports[].reason_for_non_performance` in `ViewTreatmentPlan` | ⬜ |

---

## TC-05: Creating Exercise Reminders / Scheduling

**Test file:** *(not yet created)*

### Positive Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-05-P1 | Assign exercises to days with reminders | Schedule saved; Google Calendar links generated | ⬜ |
| TC-05-P2 | Assign exercise without reminder | Saved without Calendar link | ⬜ |
| TC-05-P3 | Save with unscheduled exercises | Confirmation modal shown; user confirms → proceeds | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-05-N1 | Enable reminder but leave date/time blank | Validation error; submit blocked | ⬜ |
| TC-05-N2 | Assign zero exercises | Either allowed (empty save) or blocked with warning | ⬜ |

### Validation Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-05-V1 | Reminder date in the past | System should warn or reject | ⬜ |

---

## TC-06: AI Medical Knowledge Search

**Test file:** `tests/e2e/test_tc06_ai_search.py`

### Positive Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-06-P1 | Basic query returns summary + sources | Summary displayed; sources listed with title, URL, content type | ✅ 🐢 |
| TC-06-P2 | Follow-up question in same session | Conversation history passed; contextual answer returned | ⬜ |
| TC-06-P3 | Click suggested topic chip | Query field pre-filled; search triggered | ✅ |
| TC-06-P4 | "New Chat" resets conversation | All results cleared; idle state restored | ✅ 🐢 |
| TC-06-P5 | "Thinking" mode search | Extended mode triggers and returns; no crash | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-06-N1 | Empty query submitted | Ask button disabled; no request sent | ✅ |
| TC-06-N2 | Gemini API unavailable | Error message shown; no crash | ⬜ |
| TC-06-N3 | Query with special characters | Handled safely; no XSS or injection | ⬜ |

### Permission Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-06-R1 | Unauthenticated user accesses `/ai-search` | Redirected to `/` | ✅ |
| TC-06-R2 | Patient can access AI search | Allowed; patient role included in request | ✅ |

---

## TC-07: Saving Medical Content to Favorites

**Test file:** `tests/e2e/test_tc06_ai_search.py`

### Positive Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-07-P1 | Patient saves a source | Source appears in `/ai-search/saved`; `saving_id` returned | ✅ 🐢 |
| TC-07-P2 | Professional verifies saved content | `physio_verification_count` or `trainer_verification_count` increments | ⬜ |
| TC-07-P3 | Remove saved content | Source disappears from saved list | ⬜ |
| TC-07-P4 | Verified content appears first | Sorted by verification count in saved list | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-07-N1 | Save same content twice | Either deduplicated or both entries shown (test for expected behavior) | ⬜ |
| TC-07-N2 | Patient tries to verify content | Verify button not visible for patient role | ✅ 🐢 |

### Permission Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-07-R1 | Only professionals see "Verify" button | Patient sees save/remove only | ⬜ |
| TC-07-R2 | Physiotherapist and Trainer have separate verification counts | Verify as physio → `physio_count` increments; as trainer → `trainer_count` | ⬜ |

---

## TC-08: Professional Verified AI Content Flow

**Test file:** `tests/e2e/test_tc06_ai_search.py`

### Positive Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-08-P1 | Professional searches and saves a source | Source appears in Saved Content with `saving_id` | ⬜ |
| TC-08-P2 | Professional verifies a saved source | `physio_verification_count` or `trainer_verification_count` increments; verification indicator displayed | ⬜ |
| TC-08-P3 | Verified content sorted higher in listings | After verification, content appears before unverified entries | ⬜ |
| TC-08-P4 | Verification indicator visible on verified content | Badge/icon visible on verified source in `SavedContentPage` | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-08-N1 | Verify action on already-verified content | System accepts (idempotent) or blocks with message | ⬜ |
| TC-08-N2 | API error on verify call | Error shown; verification count unchanged | ⬜ |

### Permission Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-08-R1 | Patient cannot see or use Verify button | Verify button absent for patient role — checked on search results AND saved content page | ✅ |
| TC-08-R2 | Physiotherapist verification counted separately from Fitness Trainer | `physio_count` and `trainer_count` are independent fields | ⬜ |

---

## TC-09: Viewing Patient Profile (Professional)

**Test file:** `tests/e2e/test_tc09_professional_views.py`

### Positive Cases — Profile and Progress

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-09-P1 | View patient with both plan types | Treatment % and Fitness % both shown on Patient Details | ✅ |
| TC-09-P2 | View patient with only one plan type | Other plan section shows "None" or empty state gracefully | ⬜ |
| TC-09-P3 | Latest visit summary shown on profile | Date, therapist name, type visible in profile card | ✅ |

### Positive Cases — Visit Summaries

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-09-P4 | Professional views patient's visit summaries list | Chronological list of sessions with date, therapist, type, diagnosis | ✅ |
| TC-09-P5 | Professional opens a specific visit summary | Full detail: all session fields; linked plan shown if exists | ✅ |

### Positive Cases — Treatment Plan and Fitness Plan

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-09-P6 | Professional views treatment plan from Patient Details | Full plan: goal, dates, exercises, per-exercise patient reports | ✅ |
| TC-09-P7 | Professional views fitness plan from Patient Details | Full fitness plan: goal, dates, exercises, progress % | ✅ |
| TC-09-P8 | Plan with per-exercise reports expanded | Each exercise expandable; all historical reports (date, status, pain, effort) listed | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-09-N1 | Patient with no visits or plans | Profile shown; Visit Summaries, Treatment Plan, and Fitness Plan sections show empty state without crashing | ✅ |
| TC-09-N2 | Non-existent patient ID in URL | Error state or redirect | ⬜ |

### Permission Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-09-R1 | Patient cannot access `/physiotherapist/patient/:id` | `RoleRoute` blocks; redirected to patient home | ✅ |
| TC-09-R2 | Professional of different role sees correct `viewer_role` | Physiotherapist sees treatment plan data; Fitness Trainer sees fitness plan data | ⬜ |

---

## TC-10: Creating Visit Summary and Treatment/Fitness Plan

**Test file:** `tests/e2e/test_tc10_create_visit.py`

### Positive Cases — Visit Summary Creation

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-10-P1 | Physiotherapist creates visit summary | Session saved; redirected to Create Treatment Plan with `session_id` | ✅ 🌱 |
| TC-10-P2 | Fitness Trainer creates visit summary | `visit_type` automatically set to "FITNESS" | ⬜ |
| TC-10-P3 | Copy previous plan checked | Prior exercises pre-populated in new plan | ⬜ |
| TC-10-P4 | Recommendations field optional | Summary saved without recommendations | ⬜ |

### Positive Cases — Plan Creation

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-10-P5 | Create plan with exercises | All exercises saved; plan linked to session | ✅ 🌱 |
| TC-10-P6 | Plan with optional notes | Notes saved and displayed in plan detail | ⬜ |
| TC-10-P7 | Physiotherapist sees PHYSIOTHERAPIST exercises only | Exercise list filtered by `visit_type` | ⬜ |
| TC-10-P8 | Fitness Trainer sees FITNESS exercises only | Exercise list filtered accordingly | ⬜ |

### Negative Cases

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-10-N1 | Submit visit summary with blank `medical_diagnosis` | Blocked; validation error | ✅ |
| TC-10-N2 | Submit visit summary with blank description | Blocked; validation error | ✅ |
| TC-10-N3 | No patient selected | Modal remains open; cannot proceed | ⬜ |
| TC-10-N4 | Submit plan with zero exercises | Blocked; "min 1 exercise required" error | ✅ |
| TC-10-N5 | End date equal to or before start date | Blocked; must be strictly after start | ✅ |
| TC-10-N6 | Blank goal | Blocked; whitespace-only also blocked | ✅ |

### Integration Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-10-I1 | Create summary → patient views summaries | New session appears in patient's `/patient/visit-summaries` | ⬜ |
| TC-10-I2 | Create plan → patient home shows exercises | Patient's `GET /patient/home/{id}` returns new exercises | ⬜ |
| TC-10-I3 | Create plan → plan appears in patient details | `PatientDetails` shows plan with 0% progress | ⬜ |

---

## TC-11: Professional Dashboard View and Logout Flow

**Test file:** `tests/e2e/test_tc11_dashboard_logout.py`

### Positive Cases — Dashboard

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-11-P1 | Dashboard loads patient cards | All assigned patients shown with progress %, diagnosis | ✅ |
| TC-11-P2 | Search filters patient list | Only matching patients shown; empty-state on no match | ✅ |
| TC-11-P3 | Click patient card → patient profile | Navigated to `PatientDetails` for that patient | ✅ |
| TC-11-P4 | "New Visit Summary" button opens modal | All-patients modal shown; search within modal works | ✅ |

### Positive Cases — Logout

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-11-P5 | Logout clears session | `authAtom` null; localStorage cleared; user at `/` | ✅ |
| TC-11-P6 | Protected route inaccessible after logout | Navigating to `/physiotherapist/home` → redirected to `/` | ✅ |
| TC-11-P7 | Query cache cleared on logout | No stale patient data visible if another user logs in on same device | ⬜ |

### Integration Tests

| ID | Title | Expected | Status |
|---|---|---|---|
| TC-11-I1 | After new report submitted → dashboard progress updates | `progress_percentage` on patient card reflects new report | ⬜ |

---

## TC-17: Route Protection (Cross-Role)

**Test file:** `tests/e2e/test_tc11_dashboard_logout.py`

| ID | Title | Steps | Expected | Status |
|---|---|---|---|---|
| TC-17-R1 | Patient → professional route | Logged in as Patient, navigate to `/physiotherapist/home` | Redirected to `/patient` | ✅ |
| TC-17-R2 | Physiotherapist → patient route | Logged in as Physiotherapist, navigate to `/patient/my-plan` | Redirected to `/physiotherapist/home` | ✅ |
| TC-17-R3 | Fitness Trainer → physiotherapist route | Navigate to `/physiotherapist/patient/123` | Redirected to `/fitness/home` | ✅ |
| TC-17-R4 | Unauthenticated → any protected route | Direct URL access without auth | Redirected to `/` | ✅ |
| TC-17-R5 | Patient → treatment plan creation page | Navigate to `/physiotherapist/patient/123/treatment-plans/new/456` | `RoleRoute` blocks; redirect to `/patient` | ✅ |

---

## How to Execute Tests

| Method | Tool | Coverage |
|---|---|---|
| **Manual E2E** | Browser with dev app (`npm run dev`) | Golden path + edge cases per role |
| **Automated E2E** | Playwright (Python) — `pytest tests/e2e/ --browser chromium` | See status column in each table above |
| **API Contract Tests** | Postman / Pytest-httpx | Every endpoint with valid and invalid payloads |
| **Frontend Unit Tests** | Vitest + Testing Library | Hook isolation — mock `apiClient`, assert mutation calls |
| **Role Guard Tests** | React Router test wrappers | Simulate `authAtom` with different roles; assert redirects via `RoleRoute` |
| **Validation Tests** | Form submission with boundary values | Blank, whitespace-only, invalid formats — assert errors before API call |
| **Integration Smoke Tests** | Manual / Playwright | Each "create" action → verify data appears in corresponding "read" screen |

### Running the Playwright suite

```bash
# All e2e tests (excluding slow Gemini tests — those run automatically but take 30-60s each)
cd server
pytest tests/e2e/ --browser chromium -v

# Only fast tests (skip Gemini API calls):
pytest tests/e2e/ --browser chromium -v \
  --ignore=tests/e2e/test_tc06_ai_search.py

# Single file
pytest tests/e2e/test_login.py --browser chromium -v
```

> **Note — seed-dependent tests:** Tests marked 🌱 mutate the database (create users, sessions, or plans).
> Re-run them against a clean state by re-executing `db/init.sql`.
