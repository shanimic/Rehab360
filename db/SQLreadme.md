# Rehab360 - Therapy & Exercise Management System

A relational database schema designed for managing physical therapy rehabilitation, patient tracking, and personalized exercise plans. This system bridges the gap between therapists and patients by providing structured treatment plans and real-time execution monitoring.

## 📌 Project Overview
This database supports a comprehensive health-tech application. It manages user roles (Therapists/Patients), documents clinical sessions, schedules weekly exercise routines with reminders, and logs patient feedback (pain levels, effort, and completion status).

## 🗂️ Database Schema

### 1. User Management
* **RegisteredUsers**: Stores profiles for both patients and therapists. Uses a composite primary key (`UserID`, `UserRole`) to allow a single ID to hold different functional roles if necessary.

### 2. Clinical Documentation
* **Sessions**: Records physical or digital visits, including medical diagnoses, treatment areas, and therapist recommendations.
* **Queries**: Tracks patient or therapist inquiries within the system.

### 3. Treatment Planning
* **Plans**: High-level treatment goals with specific start and end dates.
* **PlanExercises**: The bridge between a plan and specific exercises, defining parameters like Reps, Sets, Weight, and Duration.
* **Exercises**: A library of physical exercises including descriptions and demonstration video URLs.

### 4. Scheduling & Tracking
* **WeeklyPlans**: Schedules specific exercises from the plan into a weekly calendar with `DATETIME` reminders and notification toggles.
* **ExerciseExecutionLog**: The core tracking table where patients report their progress, pain levels (1-10), and reasons for non-performance.

### 5. Content & Recommendations
* **Content**: Educational resources (articles/videos) linked to user queries.
* **RecommendedContent**: Personalized content suggestions pushed to specific users.

## 🛠️ Technical Specifications
* **Language**: SQL (Compatible with MySQL / PostgreSQL).
* **Key Features**: 
    * Extensive use of **Foreign Keys** to ensure referential integrity.
    * **Composite Keys** used in scheduling tables to prevent duplicate entries.
    * **Data Validation**: Strict `NOT NULL` constraints on clinical and identity fields.

## 🚀 Setup Instructions
To initialize the database, execute the script in the following order to respect table dependencies:
1. `RegisteredUsers`, `Exercises`
2. `Sessions`, `Queries`
3. `Plans` -> `PlanExercises` -> `WeeklyPlans`
4. `ExerciseExecutionLog`, `Content`, `RecommendedContent`

---
*Developed as part of an Information Systems final project.*