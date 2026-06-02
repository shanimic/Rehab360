# Rehab360 — User Stories

## Format

Each story follows: **"As a [Role], I want to [action], so that [benefit]."**

| Badge | Role |
|---|---|
| **P** | Patient |
| **PT** | Physiotherapist |
| **FT** | Fitness Trainer |

---

## Authentication & Account

| # | Role | User Story |
|---|---|---|
| US-01 | P / PT / FT | As a **user**, I want to select my role before logging in, so that the system can direct me to the correct interface. |
| US-02 | P / PT / FT | As a **user**, I want to log in with my email and password, so that I can securely access my personal data. |
| US-03 | P / PT / FT | As a **new user**, I want to register an account by providing my personal details and role, so that I can start using the platform. |
| US-04 | PT / FT | As a **professional**, I want to include my license number during registration, so that I can be identified as a verified healthcare provider. |
| US-05 | P / PT / FT | As a **user**, I want my session to persist after a page refresh, so that I do not have to log in repeatedly. |
| US-06 | P / PT / FT | As a **user**, I want to log out at any time, so that my account remains secure on shared devices. |

---

## Patient — Exercise & Plan

| # | Role | User Story |
|---|---|---|
| US-07 | P | As a **patient**, I want to see my daily exercise summary and progress on my home dashboard, so that I can quickly understand how I am progressing. |
| US-08 | P | As a **patient**, I want to view today's and tomorrow's assigned exercises, so that I can plan and prepare for my rehabilitation sessions. |
| US-09 | P | As a **patient**, I want to expand the full weekly exercise view, so that I can see my entire week's workload at a glance. |
| US-10 | P | As a **patient**, I want to open an individual exercise and watch the instructional video, so that I can perform the exercise correctly. |
| US-11 | P | As a **patient**, I want to report that I completed an exercise and rate my pain and effort levels (0–10), so that my therapist can monitor my wellbeing. |
| US-12 | P | As a **patient**, I want to report that I did NOT complete an exercise and provide a reason, so that my therapist understands the barrier I faced. |
| US-13 | P | As a **patient**, I want to optionally submit a change request alongside my exercise report, so that I can communicate feedback about the exercise difficulty or suitability. |
| US-14 | P | As a **patient**, I want to assign exercises to specific days in my weekly schedule, so that I can organise my rehabilitation routine. |
| US-15 | P | As a **patient**, I want to set a reminder date and time for each scheduled exercise, so that I do not forget to complete them. |
| US-16 | P | As a **patient**, I want to sync my exercise reminders to Google Calendar, so that my rehabilitation plan is integrated with my daily schedule. |

---

## Patient — Progress & History

| # | Role | User Story |
|---|---|---|
| US-17 | P | As a **patient**, I want to view my rehabilitation progress percentage for both my physiotherapy and fitness plans, so that I can see how much I have achieved. |
| US-18 | P | As a **patient**, I want to view all my historical visit summaries, so that I can review what was discussed and recommended during each session. |
| US-19 | P | As a **patient**, I want to view the full detail of a specific visit summary, so that I can check the treatment area, diagnosis, therapist notes, and linked plan. |
| US-20 | P | As a **patient**, I want to see my active treatment and fitness plans linked from my profile, so that I can navigate to plan details quickly. |

---

## Patient — AI Search & Saved Content

| # | Role | User Story |
|---|---|---|
| US-21 | P | As a **patient**, I want to search for medical and rehabilitation topics using AI, so that I can access reliable information relevant to my condition. |
| US-22 | P | As a **patient**, I want to ask follow-up questions in the same AI search session, so that I can explore a topic in depth without starting over. |
| US-23 | P | As a **patient**, I want to save AI search sources to my personal library, so that I can revisit useful articles or guides later. |
| US-24 | P | As a **patient**, I want to remove saved content I no longer need, so that my library stays relevant. |

---

## Physiotherapist — Patient Management

| # | Role | User Story |
|---|---|---|
| US-25 | PT | As a **physiotherapist**, I want to see a dashboard of all my assigned patients with their progress percentages, so that I can prioritise who needs attention. |
| US-26 | PT | As a **physiotherapist**, I want to search and filter my patient list, so that I can quickly find a specific patient. |
| US-27 | PT | As a **physiotherapist**, I want to view a patient's full profile including personal info, latest visit, and plan progress, so that I have context before a session. |
| US-28 | PT | As a **physiotherapist**, I want to create a visit summary after each patient session, recording the date, treatment area, diagnosis, and description, so that there is a clinical record of every interaction. |
| US-29 | PT | As a **physiotherapist**, I want to create a treatment plan linked to a visit summary, specifying exercises, goal, start/end dates, and parameters (reps, sets, weight), so that the patient has a structured rehabilitation program. |
| US-30 | PT | As a **physiotherapist**, I want to copy the exercises from a patient's previous plan into a new plan, so that I can build on prior work without re-entering everything. |
| US-31 | PT | As a **physiotherapist**, I want to view the full detail of a patient's treatment plan including all exercise reports (pain, effort, completion), so that I can assess adherence and outcomes. |
| US-32 | PT | As a **physiotherapist**, I want to view all of a patient's visit summaries in chronological order, so that I can track the history of their treatment. |

---

## Fitness Trainer — Patient Management

| # | Role | User Story |
|---|---|---|
| US-33 | FT | As a **fitness trainer**, I want to see a dashboard of all my assigned clients with their progress percentages, so that I know who to follow up with. |
| US-34 | FT | As a **fitness trainer**, I want to create a visit summary and linked fitness plan for a patient, so that I can assign a structured training program. |
| US-35 | FT | As a **fitness trainer**, I want the exercise list to be filtered to fitness exercises only (not physiotherapy exercises), so that I assign appropriate exercises for my role. |
| US-36 | FT | As a **fitness trainer**, I want to view a patient's fitness plan and their exercise reports, so that I can monitor progress and adapt the plan. |

---

## Physiotherapist & Fitness Trainer — AI Search & Content

| # | Role | User Story |
|---|---|---|
| US-37 | PT / FT | As a **professional**, I want to search for medical and rehabilitation topics using AI, so that I can access evidence-based resources to support clinical decisions. |
| US-38 | PT / FT | As a **professional**, I want to verify AI search sources that I find credible, so that patients and other professionals can see which content is professionally endorsed. |
| US-39 | PT / FT | As a **professional**, I want my verifications to be counted separately from other role verifications (physio vs trainer), so that the source of endorsement is clear. |
| US-40 | PT / FT | As a **professional**, I want to save and manage my own library of AI search content, so that I can refer back to useful resources in future consultations. |

---

## Summary by Role

| Role | Story IDs | Total |
|---|---|---|
| Patient (P) | US-01 to US-06 (shared), US-07 to US-24 | 24 |
| Physiotherapist (PT) | US-01 to US-06 (shared), US-25 to US-32, US-37 to US-40 | 18 |
| Fitness Trainer (FT) | US-01 to US-06 (shared), US-33 to US-40 | 14 |
| **Total unique stories** | **US-01 to US-40** | **40** |
