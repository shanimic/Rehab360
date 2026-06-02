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

## Process 2 — User Registration (Sign Up)

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

## Process 3 — Patient Home Dashboard

| Column | Detail |
|---|---|
| **Process Name** | Viewing Patient Dashboard |
| **Description** | The authenticated patient sees their daily exercise summary, weekly completion percentages, and progress bars for their physiotherapy and fitness plans. |
| **User Role Responsible** | Patient |
| **Preconditions** | Patient is logged in. At least one treatment or fitness plan exists. |
| **Main Flow Steps** | 1. Patient navigates to `/patient`. 2. App calls `GET /patient/home/{patient_id}`. 3. Dashboard renders: daily exercises, weekly completion %, physiotherapy progress %, fitness progress %, daily completion count. |
| **Expected System Response** | Dashboard displays up-to-date stats. If no plan: empty state shown. |
| **Related Screens/Pages** | `PatientHome.tsx` |

---

## Process 4 — Viewing Today's Exercise Plan

| Column | Detail |
|---|---|
| **Process Name** | Viewing Today's Exercise Plan |
| **Description** | Patient views the exercises assigned for today and tomorrow, and can expand to see the full week. |
| **User Role Responsible** | Patient |
| **Preconditions** | Patient is logged in. A treatment plan with exercises exists and is active (start_date ≤ today ≤ end_date). |
| **Main Flow Steps** | 1. Patient navigates to `/patient/my-plan`. 2. App calls `GET /exercise/{patient_id}`. 3. Today's exercises shown (active/completed). 4. Tomorrow's exercises shown. 5. Patient can expand "View All" → calls `GET /exercise/{patient_id}/weekly`. |
| **Expected System Response** | Exercise list displayed with names, reps, sets, and completion status. Completed exercises are visually differentiated. |
| **Related Screens/Pages** | `MyPlan.tsx` |

---

## Process 5 — Reporting Exercise Completion

| Column | Detail |
|---|---|
| **Process Name** | Reporting Exercise Completion |
| **Description** | Patient opens a specific exercise, watches the instructional video, and reports that they completed the exercise along with pain and effort levels. |
| **User Role Responsible** | Patient |
| **Preconditions** | Patient is logged in. Exercise exists in today's plan and has not been reported today. |
| **Main Flow Steps** | 1. Patient clicks an exercise in My Plan → `/patient/exercise/:id`. 2. App calls `GET /exercise/{exercise_id}/{patient_id}`. 3. Patient views video (YouTube embed) and instructions. 4. Patient selects "Completed" (Yes). 5. Patient sets pain level (0–10 slider). 6. Patient sets effort level (0–10 slider). 7. Patient optionally fills "Request for Change". 8. Patient submits → `POST /exercise/{exercise_id}/{patient_id}` with `execution_status: true`. |
| **Expected System Response** | Report saved. Exercise marked as completed. Progress percentages updated. Patient redirected to My Plan. |
| **Related Screens/Pages** | `ExerciseReport.tsx`, `MyPlan.tsx` |

---

## Process 6 — Reporting Exercise Non-Completion

| Column | Detail |
|---|---|
| **Process Name** | Reporting Exercise Non-Completion |
| **Description** | Patient reports that they did NOT complete an exercise and provides a mandatory reason. |
| **User Role Responsible** | Patient |
| **Preconditions** | Patient is logged in. Exercise exists in today's plan. |
| **Main Flow Steps** | 1. Patient opens an exercise → `/patient/exercise/:id`. 2. Patient selects "Not Completed" (No). 3. Reason textarea becomes visible and required. 4. Patient fills in reason for non-performance. 5. Patient optionally fills "Request for Change". 6. Patient submits → `POST /exercise/{exercise_id}/{patient_id}` with `execution_status: false`. |
| **Expected System Response** | Non-completion report saved with reason. Exercise marked as not completed. Professional can view reason in treatment plan detail. |
| **Related Screens/Pages** | `ExerciseReport.tsx` |

---

## Process 7 — Creating Exercise Reminders (Weekly Schedule)

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

## Process 8 — Viewing Rehabilitation Progress

| Column | Detail |
|---|---|
| **Process Name** | Viewing Rehabilitation Progress |
| **Description** | Patient (or professional) views a treatment or fitness plan's detailed progress, including all exercise reports with pain, effort, and completion data over time. |
| **User Role Responsible** | Patient (self-view via `/patient/my-process`), Physiotherapist / Fitness Trainer (via patient detail pages) |
| **Preconditions** | User is logged in. A plan with submitted reports exists. |
| **Main Flow Steps** | 1. Navigate to Patient Details (`/patient/my-process` for patient, `/physiotherapist/patient/:id` for professional). 2. App calls `GET /patient-details/{patient_id}?viewer_role={role}`. 3. Basic info, latest visit, treatment plan progress %, fitness plan progress % shown. 4. Click plan link → `GET /treatment-plan/plan/{plan_id}`. 5. Full plan shown: goal, dates, exercises with per-exercise patient reports (date, status, pain, effort). |
| **Expected System Response** | Complete progress view with all historical reports per exercise. Progress percentage calculated from completed vs total reports. |
| **Related Screens/Pages** | `PatientDetails.tsx`, `ViewTreatmentPlan.tsx` |

---

## Process 9 — AI Medical Knowledge Search

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

## Process 10 — Saving Medical Content to Favorites

| Column | Detail |
|---|---|
| **Process Name** | Saving Medical Content to Favorites |
| **Description** | After an AI search, any user can save a source to their personal library. Professionals can additionally mark content as "verified." |
| **User Role Responsible** | Patient / Physiotherapist / Fitness Trainer (save); Physiotherapist / Fitness Trainer (verify) |
| **Preconditions** | User is logged in. An AI search result with sources is displayed. |
| **Main Flow Steps** | 1. User performs AI search (see Process 9). 2. User clicks Save on a source → `POST /ai-search/saved-content`. 3. User navigates to `/ai-search/saved` → `GET /ai-search/saved-content/{user_id}`. 4. **Professional only:** Clicks "Verify" on a saved source → `POST /ai-search/verified-content`. 5. User can remove content → `DELETE /ai-search/saved-content/{saving_id}`. |
| **Expected System Response** | Content appears in Saved Content page. Verified content shows higher verification counts and is prioritized in listings. Professionals' verifications are tracked separately (physio_count vs trainer_count). |
| **Related Screens/Pages** | `AiSearchPage.tsx`, `SavedContentPage.tsx` |

---

## Process 11 — Viewing Visit Summaries (Patient)

| Column | Detail |
|---|---|
| **Process Name** | Viewing Visit Summaries |
| **Description** | Patient views a chronological list of all their clinical visit summaries created by their professionals, and can open each for full detail. |
| **User Role Responsible** | Patient (read-only), Physiotherapist / Fitness Trainer (read) |
| **Preconditions** | User is logged in. At least one visit summary exists for the patient. |
| **Main Flow Steps** | 1. Patient navigates to `/patient/visit-summaries`. 2. App calls `GET /visit-summary/sessions/{patient_id}`. 3. List of sessions displayed (date, therapist, treatment area, diagnosis). 4. Patient clicks a session → `/patient/visit-summaries/:visitId`. 5. App calls `GET /visit-summary/{session_id}`. 6. Full detail shown: therapist info, visit data, linked treatment plan link. |
| **Expected System Response** | Ordered list of visits displayed. Detail view shows all session fields including linked plan (if any). |
| **Related Screens/Pages** | `AllVisitSummaries.tsx`, `VisitSummaryDetail.tsx` |

---

## Process 12 — Creating a Visit Summary (Professional)

| Column | Detail |
|---|---|
| **Process Name** | Creating Visit Summary |
| **Description** | A Physiotherapist or Fitness Trainer creates a clinical visit summary after a patient session. This creates a session record and optionally triggers treatment plan creation. |
| **User Role Responsible** | Physiotherapist / Fitness Trainer |
| **Preconditions** | Professional is logged in. Patient exists in the system. |
| **Main Flow Steps** | 1. Professional clicks "New Visit Summary" on Home Dashboard. 2. Selects patient from "All Patients" modal (`GET /home/all-patients`). 3. Navigated to `/physiotherapist/patient/:id/visit-summaries/new`. 4. App calls `GET /visit-summary/patient/{patient_id}` + `GET /visit-summary/has-previous-plan/{patient_id}`. 5. Professional fills: visit date/time, treatment area, medical diagnosis (required), description (required), recommendations (optional). 6. Optionally checks "Copy previous plan". 7. Submits → `POST /visit-summary`. 8. On success: `session_id` returned → redirected to Create Treatment Plan. |
| **Expected System Response** | Visit summary saved. Professional navigated to `/physiotherapist/patient/:id/treatment-plans/new/:sessionId` to create the associated plan. |
| **Related Screens/Pages** | `HomePage.tsx`, `CreateVisitSummary.tsx`, `CreateTreatmentPlan.tsx` |

---

## Process 13 — Creating a Treatment / Fitness Plan (Professional)

| Column | Detail |
|---|---|
| **Process Name** | Creating Treatment / Fitness Plan |
| **Description** | After creating a visit summary, the professional builds a structured exercise plan with goals, dates, and specific exercises for the patient. |
| **User Role Responsible** | Physiotherapist (Treatment Plan) / Fitness Trainer (Fitness Plan) |
| **Preconditions** | A visit summary (session) has been created. Professional is on Create Treatment Plan page. |
| **Main Flow Steps** | 1. App calls `GET /treatment-plan/context/{session_id}` (diagnosis, visit type). 2. App calls `GET /treatment-plan/exercises?visit_type={type}` (available exercises). 3. Professional fills: goal (required), start date, end date (must be > start), notes (optional). 4. Opens exercise selector modal; selects exercises; sets reps, sets, weight, duration, unit, description per exercise (min 1). 5. Submits → `POST /treatment-plan/{session_id}`. 6. On success: redirects to visit summaries list. |
| **Expected System Response** | Plan saved with all exercises. Patient's daily exercise list updated. Progress tracking begins. |
| **Related Screens/Pages** | `CreateTreatmentPlan.tsx`, `AllVisitSummaries.tsx` |

---

## Process 14 — Viewing Patient Profile (Professional)

| Column | Detail |
|---|---|
| **Process Name** | Viewing Patient Profile |
| **Description** | A Physiotherapist or Fitness Trainer views a patient's full profile including personal info, latest visit summary, and progress on both treatment and fitness plans. |
| **User Role Responsible** | Physiotherapist / Fitness Trainer |
| **Preconditions** | Professional is logged in. Patient exists and has been seen at least once. |
| **Main Flow Steps** | 1. Professional clicks a patient card on Home Dashboard. 2. Navigated to `/physiotherapist/patient/:patientId` or `/fitness/patient/:patientId`. 3. App calls `GET /patient-details/{patient_id}?viewer_role={role}`. 4. Profile card displayed (name, phone, email, age, birth date). 5. Latest visit summary shown (date, therapist, type). 6. Treatment plan progress % shown. 7. Fitness plan progress % shown. 8. Links to: Visit Summaries, Treatment Plan detail, Fitness Plan detail. |
| **Expected System Response** | Full patient profile rendered with real-time progress data from reports. |
| **Related Screens/Pages** | `PatientDetails.tsx`, `HomePage.tsx` |

---

## Process 15 — Professional Home / Analytics Dashboard

| Column | Detail |
|---|---|
| **Process Name** | Viewing Analytics Dashboard (Professional) |
| **Description** | Professional's home page showing patient roster with progress percentages, priority alerts (pain spikes, inactivity, milestones), and today's appointment schedule. |
| **User Role Responsible** | Physiotherapist / Fitness Trainer |
| **Preconditions** | Professional is logged in. At least one patient is assigned. |
| **Main Flow Steps** | 1. Professional navigates to `/physiotherapist/home` or `/fitness/home`. 2. App calls `GET /home/patients?therapist_id={id}&therapist_role={role}`. 3. Patient cards shown (name, diagnosis, progress %, last update). 4. Priority alerts displayed (pain_spike, inactivity, stuck, milestone, overexertion) — *currently mock data*. 5. Today's schedule shown — *currently mock data*. 6. Professional can search/filter patients. |
| **Expected System Response** | Dashboard shows all assigned patients with current progress. Alerts flag patients needing attention. |
| **Related Screens/Pages** | `HomePage.tsx` |

---

## Process 16 — User Logout

| Column | Detail |
|---|---|
| **Process Name** | User Logout |
| **Description** | Any authenticated user logs out, clearing all local auth state and server-side query cache. |
| **User Role Responsible** | Patient / Physiotherapist / Fitness Trainer |
| **Preconditions** | User is logged in. |
| **Main Flow Steps** | 1. User clicks "Logout" in the TopNav sidebar. 2. `useLogout()` hook fires: clears `authAtom` → null, resets TanStack Query cache, clears other atoms. 3. User redirected to `/` (Landing Page). |
| **Expected System Response** | Session cleared from localStorage. All cached data cleared. User sees Landing Page. Protected routes no longer accessible. |
| **Related Screens/Pages** | `TopNav.tsx`, `LandingPage.tsx` |

---

# PART 2 — DETAILED TEST CASES

---

## TC-01: User Login and Authentication

### Positive Cases

| ID | Title | Steps | Expected |
|---|---|---|---|
| TC-01-P1 | Successful patient login | Enter valid email + password with Patient role | Redirected to `/patient`; `authAtom` has `role: PATIENT` |
| TC-01-P2 | Successful physiotherapist login | Valid credentials with Physiotherapist role | Redirected to `/physiotherapist/home` |
| TC-01-P3 | Successful fitness trainer login | Valid credentials with FITNESS_TRAINER role | Redirected to `/fitness/home` |
| TC-01-P4 | Session persists on page refresh | Login, then refresh the page | User remains logged in; `authAtom` rehydrated from localStorage |

### Negative Cases

| ID | Title | Steps | Expected |
|---|---|---|---|
| TC-01-N1 | Wrong password | Enter correct email, wrong password | Error message shown; no redirect |
| TC-01-N2 | Non-existent email | Enter email not in system | Error message shown |
| TC-01-N3 | Wrong role selected | Enter physiotherapist credentials but select Patient role | API error / access denied |
| TC-01-N4 | Empty email field | Submit form with blank email | Validation error on email field |
| TC-01-N5 | Empty password field | Submit form with blank password | Validation error on password field |

### Validation Cases

| ID | Title | Expected |
|---|---|---|
| TC-01-V1 | Email format check | `invalid-email` rejected before API call |
| TC-01-V2 | Role is required | Submit with no role selected → blocked |

### Permission / Role Tests

| ID | Title | Steps | Expected |
|---|---|---|---|
| TC-01-R1 | Patient cannot access `/physiotherapist/home` | Navigate directly to physiotherapist home while logged in as patient | `RoleRoute` redirects to `/patient` |
| TC-01-R2 | Unauthenticated user redirected to login | Navigate to `/patient` without auth | Redirected to `/login` |
| TC-01-R3 | Fitness trainer cannot access physiotherapist routes | Navigate to `/physiotherapist/home` as trainer | `RoleRoute` redirects to `/fitness/home` |

---

## TC-02: User Registration

### Positive Cases

| ID | Title | Steps | Expected |
|---|---|---|---|
| TC-02-P1 | Patient registration with all fields | Fill all required fields, submit | Account created; redirected to login |
| TC-02-P2 | Physiotherapist registration with license number | Fill all fields including `license_number` | Account created |
| TC-02-P3 | Fitness Trainer registration | Select Fitness Trainer role, fill fields | Account created |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-02-N1 | Duplicate email | Error: "email already in use" |
| TC-02-N2 | Missing required field (e.g., first_name) | Validation error on that field |
| TC-02-N3 | Invalid birth date format | Validation error |
| TC-02-N4 | Password too short/weak | Validation error on password |

### Validation Cases

| ID | Title | Expected |
|---|---|---|
| TC-02-V1 | Phone number format | Invalid phone rejected |
| TC-02-V2 | Birth date in the future | Rejected with appropriate error |

---

## TC-03: Patient Home Dashboard

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-03-P1 | Dashboard loads with active plan | All stats displayed: daily exercises, weekly completion %, progress bars |
| TC-03-P2 | Dashboard reflects completed exercises | `daily_completions.completed_sum` increments after reporting |
| TC-03-P3 | Progress bars show correct percentages | `fitness_percentage` and `physiotherapist_percentage` match backend calculation |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-03-N1 | No active plan | Empty state message shown; no crash |
| TC-03-N2 | API returns 500 | Error state displayed gracefully |

### Integration Tests

| ID | Title | Expected |
|---|---|---|
| TC-03-I1 | Complete exercise → return to home → stats update | `GET /patient/home/{id}` refetched; numbers reflect new report |

---

## TC-04: Viewing Today's Exercise Plan

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-04-P1 | Today's exercises load | List of exercises for today shown with name, reps, sets, status |
| TC-04-P2 | Tomorrow's exercises shown | Next-day exercises visible below today's |
| TC-04-P3 | Expand to full week | "View All" triggers weekly API call; all 7 days shown |
| TC-04-P4 | Completed exercises visually distinguished | Completed exercises have different styling |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-04-N1 | No exercises today | Empty state shown; no crash |
| TC-04-N2 | Plan expired (end_date < today) | Empty or "Plan ended" message |

### Permission Tests

| ID | Title | Expected |
|---|---|---|
| TC-04-R1 | Physiotherapist cannot access `/patient/my-plan` | Redirected to professional home |

---

## TC-05: Reporting Exercise Completion

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-05-P1 | Report exercise as completed | `execution_status: true`, pain=5, effort=7 saved; exercise marked complete |
| TC-05-P2 | Report with pain level 0 | Accepted; no minimum pain required |
| TC-05-P3 | Report with optional change request | `request_for_change` saved alongside report |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-05-N1 | Submit without selecting completion status | Form blocked; validation error shown |
| TC-05-N2 | API call fails (network error) | Error shown; report not recorded; user can retry |

### Validation Cases

| ID | Title | Expected |
|---|---|---|
| TC-05-V1 | Pain level outside 0–10 | Slider enforces bounds; value clamped |
| TC-05-V2 | Effort level outside 0–10 | Slider enforces bounds |

### Integration Tests

| ID | Title | Expected |
|---|---|---|
| TC-05-I1 | Complete exercise → view treatment plan | Report appears in `patient_reports` for that exercise in `ViewTreatmentPlan` |
| TC-05-I2 | Complete exercise → check home dashboard | `daily_completions.completed_sum` incremented |

---

## TC-06: Reporting Exercise Non-Completion

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-06-P1 | Report not completed with reason | `execution_status: false`, reason saved; exercise shows non-completion |
| TC-06-P2 | Non-completion with change request | Both reason and change request saved |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-06-N1 | Select "Not Completed" but leave reason blank | Submit blocked; reason field shows required error |
| TC-06-N2 | Reason is only whitespace | Treated as empty; blocked |

### Integration Tests

| ID | Title | Expected |
|---|---|---|
| TC-06-I1 | Report non-completion → professional views plan | Reason visible in `reports[].reason_for_non_performance` in `ViewTreatmentPlan` |

---

## TC-07: Creating Exercise Reminders (Weekly Schedule)

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-07-P1 | Assign exercises to days with reminders | Schedule saved; Google Calendar links generated |
| TC-07-P2 | Assign exercise without reminder | Saved without Calendar link |
| TC-07-P3 | Save with unscheduled exercises | Confirmation modal shown; user confirms → proceeds |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-07-N1 | Enable reminder but leave date/time blank | Validation error; submit blocked |
| TC-07-N2 | Assign zero exercises | Either allowed (empty save) or blocked with warning |

### Validation Cases

| ID | Title | Expected |
|---|---|---|
| TC-07-V1 | Reminder date in the past | System should warn or reject |

---

## TC-08: Viewing Rehabilitation Progress

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-08-P1 | Patient views own progress | `PatientDetails` shows both plan progress %; clicking plan loads `ViewTreatmentPlan` |
| TC-08-P2 | Professional views patient progress | Same data shown under professional route |
| TC-08-P3 | Plan with multiple exercises each with reports | Each exercise expandable; all reports listed |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-08-N1 | No plan exists | Graceful empty state for both treatment and fitness plan sections |
| TC-08-N2 | Plan exists but no reports yet | Shows 0% progress; exercise list shown without reports |

### Permission Tests

| ID | Title | Expected |
|---|---|---|
| TC-08-R1 | Patient cannot view another patient's progress | `RoleRoute` prevents access to `/physiotherapist/patient/:otherId` |

---

## TC-09: AI Medical Knowledge Search

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-09-P1 | Basic query returns summary + sources | Summary displayed; sources listed with title, URL, content type |
| TC-09-P2 | Follow-up question in same session | Conversation history passed; contextual answer returned |
| TC-09-P3 | Click suggested topic chip | Query field pre-filled; search triggered |
| TC-09-P4 | "New Chat" resets conversation | All results cleared; idle state restored |
| TC-09-P5 | "Thinking" mode search | Extended mode triggers and returns; no crash |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-09-N1 | Empty query submitted | Submit blocked or API returns error gracefully |
| TC-09-N2 | Gemini API unavailable | Error message shown; no crash |
| TC-09-N3 | Query with special characters | Handled safely; no XSS or injection |

### Permission Tests

| ID | Title | Expected |
|---|---|---|
| TC-09-R1 | Unauthenticated user accesses `/ai-search` | Redirected to login |
| TC-09-R2 | Patient can access AI search | Allowed; patient role included in request |

---

## TC-10: Saving Medical Content to Favorites

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-10-P1 | Patient saves a source | Source appears in `/ai-search/saved`; `saving_id` returned |
| TC-10-P2 | Professional verifies saved content | `physio_verification_count` or `trainer_verification_count` increments |
| TC-10-P3 | Remove saved content | Source disappears from saved list |
| TC-10-P4 | Verified content appears first | Sorted by verification count in saved list |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-10-N1 | Save same content twice | Either deduplicated or both entries shown (test for expected behavior) |
| TC-10-N2 | Patient tries to verify content | Verify button not visible for patient role |

### Permission Tests

| ID | Title | Expected |
|---|---|---|
| TC-10-R1 | Only professionals see "Verify" button | Patient sees save/remove only |
| TC-10-R2 | Physiotherapist and Trainer have separate verification counts | Verify as physio → `physio_count` increments; as trainer → `trainer_count` |

---

## TC-11: Viewing Visit Summaries (Patient)

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-11-P1 | Patient sees full list of sessions | Chronological list with date, therapist, type badge, diagnosis |
| TC-11-P2 | Patient opens a session | Full detail: all fields shown; plan link if plan exists |
| TC-11-P3 | Filter by visit type | "Physical Therapy" filter shows only PHYSIOTHERAPIST sessions |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-11-N1 | No sessions exist | Empty state message |
| TC-11-N2 | Invalid visitId in URL | 404 or error state |

### Permission Tests

| ID | Title | Expected |
|---|---|---|
| TC-11-R1 | Patient sees only their own summaries | API scoped to `patient_id` from `authAtom` |

---

## TC-12: Creating Visit Summary (Professional)

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-12-P1 | Physiotherapist creates visit summary | Session saved; redirected to Create Treatment Plan with `session_id` |
| TC-12-P2 | Fitness Trainer creates visit summary | `visit_type` automatically set to "FITNESS" |
| TC-12-P3 | Copy previous plan checked | Prior exercises pre-populated in new plan |
| TC-12-P4 | Recommendations field optional | Summary saved without recommendations |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-12-N1 | Submit with blank `medical_diagnosis` | Blocked; validation error |
| TC-12-N2 | Submit with blank description | Blocked; validation error |
| TC-12-N3 | No patient selected | Modal remains open; cannot proceed |

### Integration Tests

| ID | Title | Expected |
|---|---|---|
| TC-12-I1 | Create summary → patient views summaries | New session appears in patient's `/patient/visit-summaries` |

---

## TC-13: Creating Treatment / Fitness Plan (Professional)

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-13-P1 | Create plan with 3 exercises | All exercises saved; plan linked to session |
| TC-13-P2 | Plan with optional notes | Notes saved and displayed in plan detail |
| TC-13-P3 | Physiotherapist sees PHYSIOTHERAPIST exercises only | Exercise list filtered by `visit_type` |
| TC-13-P4 | Fitness Trainer sees FITNESS exercises only | Exercise list filtered accordingly |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-13-N1 | Submit with zero exercises | Blocked; "min 1 exercise required" error |
| TC-13-N2 | End date equal to start date | Blocked; must be strictly after start |
| TC-13-N3 | End date before start date | Blocked |
| TC-13-N4 | Blank goal | Blocked; whitespace-only also blocked |
| TC-13-N5 | Goal is only spaces | Backend Pydantic validator rejects |

### Integration Tests

| ID | Title | Expected |
|---|---|---|
| TC-13-I1 | Create plan → patient home shows exercises | Patient's `GET /patient/home/{id}` returns new exercises |
| TC-13-I2 | Create plan → plan appears in patient details | `PatientDetails` shows plan with 0% progress |

---

## TC-14: Viewing Patient Profile (Professional)

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-14-P1 | View patient with both plan types | Treatment % and Fitness % both shown |
| TC-14-P2 | View patient with only one plan type | Other plan shows "None" or empty state |
| TC-14-P3 | Latest visit summary shown | Date, therapist name, type visible |

### Negative Cases

| ID | Title | Expected |
|---|---|---|
| TC-14-N1 | Patient with no visits or plans | Profile shown; all plan/visit sections empty without crashing |
| TC-14-N2 | Non-existent patient ID in URL | Error state or redirect |

### Permission Tests

| ID | Title | Expected |
|---|---|---|
| TC-14-R1 | Patient cannot access `/physiotherapist/patient/:id` | `RoleRoute` blocks; redirected to patient home |
| TC-14-R2 | Professional of different role sees correct `viewer_role` | Physiotherapist sees treatment plan; Fitness Trainer sees fitness plan |

---

## TC-15: Professional Analytics Dashboard

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-15-P1 | Dashboard loads patient cards | All assigned patients shown with progress %, diagnosis |
| TC-15-P2 | Search filters patient list | Only matching patients shown |
| TC-15-P3 | Click patient card → patient profile | Navigated to `PatientDetails` for that patient |
| TC-15-P4 | "New Visit Summary" button opens modal | All-patients modal shown; search within modal works |

### Integration Tests

| ID | Title | Expected |
|---|---|---|
| TC-15-I1 | After new report submitted → dashboard progress updates | `progress_percentage` on patient card reflects new report |

---

## TC-16: User Logout

### Positive Cases

| ID | Title | Expected |
|---|---|---|
| TC-16-P1 | Logout clears session | `authAtom` null; localStorage cleared; user at `/` |
| TC-16-P2 | Protected route inaccessible after logout | Navigating to `/patient` → redirected to `/login` |
| TC-16-P3 | Query cache cleared | No stale patient data visible if another user logs in on same device |

---

## TC-17: Route Protection (Cross-Role)

| ID | Title | Steps | Expected |
|---|---|---|---|
| TC-17-R1 | Patient → professional route | Logged in as Patient, navigate to `/physiotherapist/home` | Redirected to `/patient` |
| TC-17-R2 | Physiotherapist → patient route | Logged in as Physiotherapist, navigate to `/patient/my-plan` | Redirected to `/physiotherapist/home` |
| TC-17-R3 | Fitness Trainer → physiotherapist route | Navigate to `/physiotherapist/patient/123` | Redirected to `/fitness/home` |
| TC-17-R4 | Unauthenticated → any protected route | Direct URL access without auth | Redirected to `/login` |
| TC-17-R5 | Patient → treatment plan creation page | Navigate to `/physiotherapist/patient/123/treatment-plans/new/456` | `RoleRoute` blocks; redirect to `/patient` |

---

## How to Execute Tests

| Method | Tool | Coverage |
|---|---|---|
| **Manual E2E** | Browser with dev app (`npm run dev`) | Golden path + edge cases per role |
| **API Contract Tests** | Postman / Pytest-httpx | Every endpoint with valid and invalid payloads |
| **Frontend Unit Tests** | Vitest + Testing Library | Hook isolation — mock `apiClient`, assert mutation calls |
| **Role Guard Tests** | React Router test wrappers | Simulate `authAtom` with different roles; assert redirects via `RoleRoute` |
| **Validation Tests** | Form submission with boundary values | Blank, whitespace-only, invalid formats — assert errors before API call |
| **Integration Smoke Tests** | Manual / Playwright | Each "create" action → verify data appears in corresponding "read" screen |
