CREATE DATABASE IF NOT EXISTS `rehab360`;
USE `rehab360`;

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

INSERT INTO registered_users (user_id, user_role, first_name, last_name, phone, birth_date, email, password_hash, license_number)
VALUES
('P100', 'PATIENT', 'Alice', 'Smith', '050-1234567', '1990-05-15', 'alice@example.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', NULL),
('T200', 'PHYSIOTHERAPIST', 'Bob', 'Johnson', '052-7654321', '1980-10-20', 'bob@physio.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'LIC-9988'),
('F300', 'FITNESS_TRAINER', 'Charlie', 'Davis', '054-0000000', '1995-02-10', 'charlie@gym.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'FIT-1122');

-- 2. Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id INT PRIMARY KEY,
    exercise_name VARCHAR(255) NOT NULL,
    difficulty_level INT NOT NULL,
    treatment_area VARCHAR(100) NOT NULL,
    ex_video_url VARCHAR(255) NOT NULL,
    text_instructions TEXT NOT NULL
);

INSERT INTO exercises (exercise_id, exercise_name, difficulty_level, treatment_area, ex_video_url, text_instructions)
VALUES
(1, 'Wall Squats', 2, 'Knee', 'https://video.link/squat', 'Lean against wall, lower hips until thighs are parallel to floor.'),
(2, 'Shoulder External Rotation', 1, 'Shoulder', 'https://video.link/shoulder', 'Keep elbow at side, rotate forearm outward with resistance band.'),
(3, 'Plank', 3, 'Core', 'https://video.link/plank', 'Hold a push-up position on your elbows for 30-60 seconds.');

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
    patient_id VARCHAR(255),
    patient_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    therapist_id VARCHAR(255),
    therapist_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    FOREIGN KEY (patient_id, patient_role) REFERENCES registered_users(user_id, user_role),
    FOREIGN KEY (therapist_id, therapist_role) REFERENCES registered_users(user_id, user_role)
);

INSERT INTO sessions (session_id, visit_date, visit_time, visit_type, treatment_area, medical_diagnosis, description, recommendations, patient_id, patient_role, therapist_id, therapist_role)
VALUES
(101, '2024-01-10', '09:00:00', 'Initial Assessment', 'Knee', 'ACL Tear recovery', 'Patient reports mild pain.', 'Start with low-impact movements.', 'P100', 'PATIENT', 'T200', 'PHYSIOTHERAPIST'),
(102, '2024-01-17', '10:30:00', 'Follow-up', 'Shoulder', 'Rotator Cuff strain', 'Improved range of motion.', 'Increase resistance band tension.', 'P100', 'PATIENT', 'T200', 'PHYSIOTHERAPIST');

-- 4. Plans Table
CREATE TABLE IF NOT EXISTS plans (
    plan_id INT PRIMARY KEY,
    goal TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    session_id INT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

INSERT INTO plans (plan_id, goal, start_date, end_date, session_id)
VALUES
(1, 'Increase knee stability', '2024-01-11', '2024-02-11', 101),
(2, 'Improve shoulder mobility', '2024-01-18', '2024-02-18', 102);

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

INSERT INTO plan_exercises (plan_id, session_id, exercise_id, reps, sets, weight, time_duration, time_unit, description)
VALUES
(1, 101, 1, 12, 3, 0, 0, 'N/A', 'Controlled descent'),
(2, 102, 2, 15, 3, 2.5, 0, 'N/A', 'Use yellow resistance band'),
(1, 101, 3, 1, 3, 0, 45, 'Seconds', 'Maintain flat back');

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

INSERT INTO weekly_plans (weekly_plan_id, plan_id, session_id, exercise_id, reminder_time, notification_enabled)
VALUES
(501, 1, 101, 1, '2024-01-12 08:00:00', TRUE),
(502, 2, 102, 2, '2024-01-19 09:00:00', TRUE);

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

INSERT INTO exercise_execution_log (log_id, weekly_plan_id, plan_id, session_id, exercise_id, execution_date, execution_status, reason_for_non_performance, pain_level, effort_level, request_for_change)
VALUES
(1, 501, 1, 101, 1, '2024-01-12', TRUE, NULL, 2, 4, 'Feels a bit easy'),
(2, 502, 2, 102, 2, '2024-01-19', FALSE, 'Felt sharp pain', 8, 2, 'Need easier alternative');

-- 8. Queries Table
CREATE TABLE IF NOT EXISTS queries (
    query_id INT PRIMARY KEY,
    query_text TEXT NOT NULL,
    query_date DATE NOT NULL,
    user_id VARCHAR(255),
    user_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    FOREIGN KEY (user_id, user_role) REFERENCES registered_users(user_id, user_role)
);

INSERT INTO queries (query_id, query_text, query_date, user_id, user_role)
VALUES
(1, 'How can I reduce knee swelling?', '2024-01-13', 'P100', 'PATIENT'),
(2, 'Latest protocols for ACL recovery?', '2024-01-14', 'T200', 'PHYSIOTHERAPIST');

-- 9. Content Table
CREATE TABLE IF NOT EXISTS content (
    content_id INT PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_title VARCHAR(255) NOT NULL,
    content_source_link VARCHAR(255) NOT NULL,
    query_id INT,
    FOREIGN KEY (query_id) REFERENCES queries(query_id)
);

INSERT INTO content (content_id, content_type, content_title, content_source_link, query_id)
VALUES
(1, 'Article', 'RICE Method for Swelling', 'https://health.blog/rice-method', 1),
(2, 'Video', 'ACL Recovery Phase 1', 'https://video.link/acl-phase1', 2);

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

INSERT INTO recommended_content (recommended_id, recommendation_date, content_id, user_id, user_role)
VALUES
(1, '2024-01-13', 1, 'P100', 'PATIENT'),
(2, '2024-01-14', 2, 'T200', 'PHYSIOTHERAPIST');