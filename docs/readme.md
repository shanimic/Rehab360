# Rehab360 – System Data Schema & API Documentation

This document outlines the JSON data structures and entity relationships for the **Rehab360** platform. The system is designed to bridge the gap between patients and healthcare professionals using data-driven insights.

---

## 1. User Authentication & Profile
Every user (Patient or Professional) is identified by a unique ID. The `role` field determines the application's behavior and access levels.

* **Primary Key:** `id_number`
* **Roles:** `patient`, `physiotherapist`, `fitness_coach`
* **Logic:** * For `role: "patient"`, `license_number` is set to `null`.
    * Professionals must provide a valid `license_number`.

---

## 2. Clinical Treatment & Training Plans
Plans follow a **Master-Detail** relationship: a Header defines the plan's scope, and the Detail contains specific exercises.

### A. Plan Header (`treatment_plan_header`)
* **Fields:** `PlanID` (PK), `idNumber` (FK), `plan_type`, `treatment_area`, `start_date`, `end_date`.

### B. Exercises in Plan (`exercises_in_plan`)
* **Fields:** `ExerciseID` (FK), `SessionID` (FK), `sets`, `reps_per_set`, `weight_resistance`, `Description`.
* **Note:** Parameters like sets and reps are customized by the therapist for each specific patient.

---

## 3. Patient Engagement & Reporting
This module handles how patients interact with their prescribed plans.

### A. Exercise Execution
* **Status:** `completed` or `skipped`.
* **Feedback Fields:** `pain_level` (1-10), `effort_level` (1-10), `client_notes`.
* **Alert Logic:** If `request_for_change` is `true`, a high-priority alert is sent to the therapist.

### B. Weekly Scheduling
* **Fields:** `day_of_week`, `scheduled_time`.
* **Global Toggle:** `is_reminder_enabled` – controls all push notifications for the user's schedule.

---

## 4. Professional Documentation (Visit Summary)
Used by therapists to log physical or digital sessions.

* **Fields:** `SessionID` (PK), `visit_date`, `visit_time`, `visit_type`, `treatment_area`, `visit_notes` (Description), `recommendations`.
* **Action:** **Save-Only** (Finalized records for medical history).

---

## 5. AI Assistant & Content Curation
Leveraging Gemini AI for patient support with a professional verification layer.

### A. AI Queries
* **Fields:** `QueryID` (PK), `idNumber` (FK), `query_content`, `query_date`, `query_time`, `ai_response`.

### B. Recommended Content (Verification)
* **Fields:** `RecommendationID` (PK), `idNumber` (FK), `physician_id` (FK), `Role`, `is_verified_by_professional`.
* **UI Logic:** Verified content is promoted to the top of search results and displays a badge (e.g., "Verified by Physiotherapist").

---

## 6. Technical Specifications
* **Data Format:** JSON
* **Date Standard:** ISO 8601 (`YYYY-MM-DD`)
* **Time Standard:** 24-hour format (`HH:MM:SS`)
* **Relational Logic:** The `idNumber` (Patient ID) is the primary connector across all modules.

---