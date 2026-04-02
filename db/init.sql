CREATE DATABASE IF NOT EXISTS `rehab360`;
USE `rehab360`;

-- CREATE TABLE IF NOT EXISTS `users` (
--     `id` INT AUTO_INCREMENT PRIMARY KEY,
--     `name` VARCHAR(255) NOT NULL,
--     `email` VARCHAR(255) NOT NULL UNIQUE,
--     `password` VARCHAR(255) NOT NULL,
--     `role` ENUM('PATIENT', 'THERAPIST') NOT NULL,
--     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- INSERT INTO `users` (`name`, `email`, `password`, `role`)
-- VALUES
--     ('Shani', 'shani@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'PATIENT'),
--     ('Liron', 'liron@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'PATIENT'),
--     ('Elran', 'elran@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'THERAPIST'),
--     ('Yogev', 'yogev@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'THERAPIST');

-- 1. Registered Users Table
CREATE TABLE IF NOT EXISTS registered_users (
    user_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER') NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    license_number VARCHAR(50),
    PRIMARY KEY (user_id, user_role)
);

-- 2. Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id INT PRIMARY KEY,
    exercise_name VARCHAR(255) NOT NULL,
    difficulty_level INT NOT NULL,
    treatment_area VARCHAR(100) NOT NULL,
    ex_video_url VARCHAR(255) NOT NULL,
    text_instructions TEXT NOT NULL
);

-- 3. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id INT PRIMARY KEY,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    visit_type VARCHAR(50) NOT NULL,
    treatment_area VARCHAR(100) NOT NULL,
    medical_diagnosis TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendations TEXT,
    patient_id VARCHAR(255), -- Must match registered_users.user_id
    patient_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    therapist_id VARCHAR(255),
    therapist_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    FOREIGN KEY (patient_id, patient_role) REFERENCES registered_users(user_id, user_role),
    FOREIGN KEY (therapist_id, therapist_role) REFERENCES registered_users(user_id, user_role)
);

-- 4. Plans Table
CREATE TABLE IF NOT EXISTS plans (
    plan_id INT PRIMARY KEY,
    goal TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    session_id INT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- 5. Plan Exercises Table
CREATE TABLE IF NOT EXISTS plan_exercises (
    plan_id INT,
    session_id INT,
    exercise_id INT,
    reps INT NOT NULL,
    sets INT NOT NULL,
    weight FLOAT NOT NULL,
    time_duration INT NOT NULL,
    time_unit VARCHAR(30) NOT NULL,
    description TEXT,
    PRIMARY KEY (plan_id, session_id, exercise_id),
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

-- 6. Weekly Plans Table
CREATE TABLE IF NOT EXISTS weekly_plans (
    weekly_plan_id INT,
    plan_id INT,
    session_id INT,
    exercise_id INT,
    reminder_time DATETIME NOT NULL,
    notification_enabled BOOLEAN,
    PRIMARY KEY (weekly_plan_id, plan_id, session_id, exercise_id),
    FOREIGN KEY (plan_id, session_id, exercise_id) REFERENCES plan_exercises(plan_id, session_id, exercise_id)
);

-- 7. Exercise Execution Log
CREATE TABLE IF NOT EXISTS exercise_execution_log (
    log_id INT PRIMARY KEY,
    weekly_plan_id INT,
    plan_id INT,
    session_id INT,
    exercise_id INT,
    execution_date DATE NOT NULL,
    execution_status BOOLEAN NOT NULL,
    reason_for_non_performance TEXT,
    pain_level INT NOT NULL,
    effort_level INT NOT NULL,
    request_for_change TEXT,
    FOREIGN KEY (weekly_plan_id, plan_id, session_id, exercise_id) 
        REFERENCES weekly_plans(weekly_plan_id, plan_id, session_id, exercise_id)
);

-- 8. Queries Table
CREATE TABLE IF NOT EXISTS queries (
    query_id INT PRIMARY KEY,
    query_text TEXT NOT NULL,
    query_date DATE NOT NULL,
    user_id VARCHAR(255),
    user_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    FOREIGN KEY (user_id, user_role) REFERENCES registered_users(user_id, user_role)
);

-- 9. Content Table
CREATE TABLE IF NOT EXISTS content (
    content_id INT PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_title VARCHAR(255) NOT NULL,
    content_source_link VARCHAR(255) NOT NULL,
    query_id INT,
    FOREIGN KEY (query_id) REFERENCES queries(query_id)
);

-- 10. Recommended Content Table
CREATE TABLE IF NOT EXISTS recommended_content (
    recommended_id INT PRIMARY KEY,
    recommendation_date DATE NOT NULL,
    content_id INT,
    user_id VARCHAR(255),
    user_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    FOREIGN KEY (content_id) REFERENCES content(content_id),
    FOREIGN KEY (user_id, user_role) REFERENCES registered_users(user_id, user_role)
);