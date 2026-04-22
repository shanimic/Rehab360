CREATE DATABASE IF NOT EXISTS `rehab360`;
USE `rehab360`;

drop table recommended_content ;
drop table content ;
drop table queries ;
drop table exercise_completion ;
drop table weekly_plans ;
drop table plan_exercises ;
drop table plans ;
drop table sessions ;
drop table exercises ;
drop table registered_users;

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
    exercise_id INT PRIMARY KEY auto_increment,
    exercise_name VARCHAR(255) NOT NULL,
    difficulty_level INT NOT NULL,
    treatment_area VARCHAR(100) NOT NULL,
    ex_video_url VARCHAR(255) NOT NULL,
    text_instructions TEXT NOT NULL,
    visit_type varchar(50) NOT NULL
);

INSERT INTO exercises (exercise_name, difficulty_level, treatment_area, ex_video_url, text_instructions,visit_type)
VALUES
('Wall Squats', 2, 'Knee', 'https://www.youtube.com/watch?v=cWTZ8Am1Ee0', 'Lean against wall, lower hips until thighs are parallel to floor.', 'FITNESS'),
( 'Shoulder External Rotation', 1, 'Shoulder', 'https://www.youtube.com/watch?v=4tpl-huz060', 'Keep elbow at side, rotate forearm outward with resistance band.', 'PHYSIOTHERAPIST'),
('Plank', 3, 'Core', 'https://www.youtube.com/watch?v=pvIjsG5Svck', 'Hold a push-up position on your elbows for 30-60 seconds.', 'FITNESS'),
('Straight Leg Raise', 1, 'Knee', 'https://www.youtube.com/watch?v=qvi8aM02_GY', 'Lie on back, keep one leg straight and lift it to 45 degrees, hold 3 seconds, lower slowly.', 'PHYSIOTHERAPIST'),
('Terminal Knee Extension', 1, 'Knee', 'https://www.youtube.com/watch?v=W7n9dUiEbLM', 'Loop resistance band behind knee, stand and straighten the knee fully against band resistance.', 'PHYSIOTHERAPIST'),
('Step-Ups', 2, 'Knee', 'https://video.link/stepup', 'Step onto a low platform one foot at a time, fully extending the knee at the top before stepping down.', 'FITNESS'),
('Bulgarian Split Squat', 3, 'Knee', 'https://video.link/bss', 'Rear foot elevated on bench, lower front knee toward floor keeping torso upright, drive back up through heel.', 'FITNESS'),
('Pendulum Exercise', 1, 'Shoulder', 'https://www.youtube.com/watch?v=9-DOa672Hxk', 'Lean forward supported on a table, let arm hang freely and make small clockwise and counterclockwise circles.', 'PHYSIOTHERAPIST'),
('Scapular Retraction', 1, 'Shoulder', 'https://www.youtube.com/watch?v=YejnTLIA9K8', 'Sit or stand tall, squeeze shoulder blades together and hold for 5 seconds, release slowly.', 'FITNESS'),
('Shoulder Internal Rotation with Band', 2, 'Shoulder', 'https://www.youtube.com/watch?v=ZXncuZKonas', 'Elbow at 90 degrees at side, rotate forearm inward toward abdomen against resistance band.', 'PHYSIOTHERAPIST'),
( 'Overhead Press', 3, 'Shoulder', 'https://www.youtube.com/watch?v=0JfYxMRsUCQ', 'Hold dumbbells at shoulder height, press straight overhead until arms fully extended, lower with control.', 'FITNESS'),
( 'Dead Bug', 2, 'Core', 'https://www.youtube.com/watch?v=4XLEnwUr1d8', 'Lie on back with arms up and knees at 90 degrees, slowly lower opposite arm and leg toward floor while pressing lower back down.', 'FITNESS'),
( 'Bird Dog', 2, 'Core', 'https://video.link/birddog', 'On hands and knees, extend opposite arm and leg simultaneously, hold 3 seconds, return and switch sides.', 'FITNESS'),
( 'Side Plank', 2, 'Core', 'https://video.link/sideplank', 'Lie on side, prop up on forearm and feet stacked, lift hips to form a straight line, hold 20-40 seconds.', 'FITNESS'),
( 'Pallof Press', 3, 'Core', 'https://video.link/pallof', 'Stand sideways to a cable or band anchor, press hands straight out from chest and hold 2 seconds resisting rotation.', 'FITNESS'),
( 'Clamshells', 1, 'Hip', 'https://video.link/clamshell', 'Lie on side with knees bent, keep feet together and rotate top knee upward like a clamshell opening, hold 2 seconds.', 'PHYSIOTHERAPIST'),
( 'Glute Bridge', 1, 'Hip', 'https://video.link/glute-bridge', 'Lie on back with knees bent, drive hips up by squeezing glutes until body is straight from shoulders to knees.', 'FITNESS'),
( 'Side-Lying Hip Abduction', 1, 'Hip', 'https://video.link/hip-abd', 'Lie on side, keep top leg straight and lift it 30-40 degrees upward, hold 2 seconds and lower slowly.', 'PHYSIOTHERAPIST'),
('Single-Leg Romanian Deadlift', 3, 'Hip', 'https://video.link/sl-rdl', 'Stand on one leg, hinge at hips and lower torso while extending free leg behind, keep back flat throughout.', 'FITNESS'),
( 'Ankle Alphabet', 1, 'Ankle', 'https://video.link/ankle-abc', 'Sit with leg extended, trace each letter of the alphabet in the air using only ankle movement.', 'PHYSIOTHERAPIST'),
( 'Calf Raises', 2, 'Ankle', 'https://video.link/calf-raise', 'Stand on edge of a step, lower heels below step level then rise up onto toes, lower slowly with control.', 'FITNESS'),
( 'Single-Leg Balance', 2, 'Ankle', 'https://video.link/sl-balance', 'Stand on one foot for 30-60 seconds, progress by closing eyes or standing on an unstable surface.', 'FITNESS'),
( 'Resistance Band Dorsiflexion', 1, 'Ankle', 'https://video.link/dorsi', 'Sit with leg straight, band looped around foot, pull toes toward shin against resistance, hold 2 seconds.', 'PHYSIOTHERAPIST'),
( 'Cat-Cow Stretch', 1, 'Lower Back', 'https://video.link/catcow', 'On hands and knees, alternate between arching the back upward and letting it sag downward in a slow rhythmic motion.', 'PHYSIOTHERAPIST'),
( 'McKenzie Press-Up', 1, 'Lower Back', 'https://video.link/mckenzie', 'Lie face down, place hands under shoulders and press upper body up while keeping hips on the floor.', 'PHYSIOTHERAPIST'),
( 'Superman Hold', 2, 'Lower Back', 'https://video.link/superman', 'Lie face down, simultaneously lift arms, chest and legs off the floor, hold 3 seconds and lower slowly.', 'FITNESS'),
( 'Romanian Deadlift', 3, 'Lower Back', 'https://video.link/rdl', 'Hold barbell at hips, hinge forward keeping back flat and pushing hips back until light stretch in hamstrings, drive hips forward to stand.', 'FITNESS'),
( 'Chin Tucks', 1, 'Neck', 'https://video.link/chintuck', 'Sit tall, gently draw chin straight back creating a double chin, hold 5 seconds, release. Keep gaze level.', 'PHYSIOTHERAPIST'),
( 'Cervical Rotation Stretch', 1, 'Neck', 'https://video.link/cerv-rot', 'Sit upright, slowly rotate head to one side as far as comfortable, hold 10 seconds, return to center and repeat other side.', 'PHYSIOTHERAPIST'),
( 'Deep Neck Flexor Activation', 2, 'Neck', 'https://video.link/dnf', 'Lie on back, gently nod chin down without lifting head off floor, hold 10 seconds. Focus on deep muscles not surface ones.', 'PHYSIOTHERAPIST'),
( 'Wrist Flexion/Extension Stretch', 1, 'Wrist', 'https://video.link/wrist-stretch', 'Extend arm with palm up, use other hand to gently bend wrist downward, hold 20 seconds each direction.', 'PHYSIOTHERAPIST'),
( 'Forearm Pronation/Supination', 1, 'Elbow', 'https://video.link/pron-sup', 'Hold a light hammer or dumbbell vertically, slowly rotate forearm palm-up then palm-down through full range.', 'PHYSIOTHERAPIST'),
( 'Eccentric Wrist Curl', 2, 'Wrist', 'https://video.link/ecc-wrist', 'Rest forearm on a table palm-up holding light dumbbell, use other hand to lift weight then lower it slowly using the wrist only.', 'FITNESS');

-- 3. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id INT PRIMARY KEY auto_increment,
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
    session_status VARCHAR(20),
    FOREIGN KEY (patient_id, patient_role) REFERENCES registered_users(user_id, user_role),
    FOREIGN KEY (therapist_id, therapist_role) REFERENCES registered_users(user_id, user_role)
)auto_increment = 101;

INSERT INTO sessions ( visit_date, visit_time, visit_type, treatment_area, medical_diagnosis, description, recommendations, patient_id, patient_role, therapist_id, therapist_role,session_status)
VALUES
('2024-01-10', '09:00:00', 'FITNESS', 'Knee', 'ACL Tear recovery', 'Patient reports mild pain.', 'Start with low-impact movements.', 'P100', 'PATIENT', 'T200', 'PHYSIOTHERAPIST','ACTIVE'),
('2024-01-17', '10:30:00', 'PHYSIOTHERAPIST', 'Shoulder', 'Rotator Cuff strain', 'Improved range of motion.', 'Increase resistance band tension.', 'P100', 'PATIENT', 'T200', 'PHYSIOTHERAPIST','ACTIVE'),
('2024-01-17', '10:30:00', 'PHYSIOTHERAPIST', 'Shoulder', 'Rotator Cuff strain', 'Improved range of motion.', 'Increase resistance band tension.', 'P100', 'PATIENT', 'T200', 'PHYSIOTHERAPIST','NOT ACTIVE');


-- 4. Plans Table
CREATE TABLE IF NOT EXISTS plans (
    plan_id INT NOT NULL auto_increment,
    session_id INT NOT NULL,
    goal TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    PRIMARY KEY (plan_id, session_id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

INSERT INTO plans (session_id, goal, start_date, end_date)
VALUES
( 101,'Increase knee stability', '2024-01-11', '2024-02-11' ),
( 102, 'Improve shoulder mobility', '2024-01-18', '2024-02-18' );

-- 5. Plan Exercises Table
CREATE TABLE IF NOT EXISTS plan_exercises (
    plan_id INT NOT NULL,
    session_id INT NOT NULL,
    exercise_id INT NOT NULL,
    reps INT NOT NULL,
    num_sets INT NOT NULL,
    weight FLOAT NOT NULL,
    time_duration INT NOT NULL,
    time_unit VARCHAR(30) NOT NULL,
    description TEXT,
    PRIMARY KEY (plan_id, session_id, exercise_id),
    FOREIGN KEY (plan_id, session_id) REFERENCES plans(plan_id, session_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

INSERT INTO plan_exercises (plan_id, session_id, exercise_id, reps, num_sets, weight, time_duration, time_unit, description)
VALUES
(1, 101, 1, 12, 3, 0, 3, 'Weekly', 'Controlled descent'),
(2, 102, 2, 15, 3, 2.5, 1, 'Daily', 'Use yellow resistance band'),
(1, 101, 3, 1, 3, 0, 2, 'Weekly', 'Maintain flat back');

-- 6. Weekly Plans Table
CREATE TABLE IF NOT EXISTS weekly_plans (
    weekly_plan_id INT auto_increment,
    plan_id INT,
    session_id INT,
    exercise_id INT,
    reminder_time DATETIME NOT NULL,
    notification_enabled BOOLEAN,
    exercise_date date,
    PRIMARY KEY (weekly_plan_id, plan_id, session_id, exercise_id),
    FOREIGN KEY (plan_id, session_id, exercise_id) REFERENCES plan_exercises(plan_id, session_id, exercise_id)
)auto_increment = 501;

INSERT INTO weekly_plans ( plan_id, session_id, exercise_id, reminder_time, notification_enabled,exercise_date )
VALUES
( 1, 101, 1, '2024-01-12 08:00:00', TRUE, CURDATE()),
( 2, 102, 2, '2024-01-19 09:00:00', TRUE, CURDATE());

-- 7. Exercise Execution Log
CREATE TABLE IF NOT EXISTS exercise_completion (
    report_id INT PRIMARY KEY auto_increment,
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
    num_exe_completed INT,
    FOREIGN KEY (weekly_plan_id, plan_id, session_id, exercise_id)
        REFERENCES weekly_plans(weekly_plan_id, plan_id, session_id, exercise_id)
) auto_increment = 300;



INSERT INTO exercise_completion ( weekly_plan_id, plan_id, session_id, exercise_id, execution_date, execution_status, reason_for_non_performance, pain_level, effort_level, request_for_change,num_exe_completed)
VALUES
(501, 1, 101, 1, CURDATE(), TRUE, NULL, 2, 4, 'Feels a bit easy',12),
(502, 2, 102, 2, CURDATE(), FALSE, 'Felt sharp pain', 8, 2, 'Need easier alternative',8);



-- 8. Queries Table
CREATE TABLE IF NOT EXISTS queries (
    query_id INT PRIMARY KEY auto_increment,
    query_text TEXT NOT NULL,
    query_date DATE NOT NULL,
    user_id VARCHAR(255),
    user_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    FOREIGN KEY (user_id, user_role) REFERENCES registered_users(user_id, user_role)
);

INSERT INTO queries (  query_text, query_date, user_id, user_role)
VALUES
( 'How can I reduce knee swelling?', '2024-01-13', 'P100', 'PATIENT'),
( 'Latest protocols for ACL recovery?', '2024-01-14', 'T200', 'PHYSIOTHERAPIST');

-- 9. Content Table
CREATE TABLE IF NOT EXISTS content (
    content_id INT PRIMARY KEY auto_increment,
    content_type VARCHAR(50) NOT NULL,
    content_title VARCHAR(255) NOT NULL,
    content_source_link VARCHAR(255) NOT NULL,
    query_id INT,
    FOREIGN KEY (query_id) REFERENCES queries(query_id)
);

INSERT INTO content ( content_type, content_title, content_source_link, query_id)
VALUES
( 'Article', 'RICE Method for Swelling', 'https://health.blog/rice-method', 1),
( 'Video', 'ACL Recovery Phase 1', 'https://video.link/acl-phase1', 2);

-- 10. Recommended Content Table
CREATE TABLE IF NOT EXISTS recommended_content (
    recommended_id INT PRIMARY KEY auto_increment,
    recommendation_date DATE NOT NULL,
    content_id INT,
    user_id VARCHAR(255),
    user_role ENUM('PHYSIOTHERAPIST', 'PATIENT', 'FITNESS_TRAINER'),
    FOREIGN KEY (content_id) REFERENCES content(content_id),
    FOREIGN KEY (user_id, user_role) REFERENCES registered_users(user_id, user_role)
);

INSERT INTO recommended_content ( recommendation_date, content_id, user_id, user_role)
VALUES
( '2024-01-13', 1, 'P100', 'PATIENT'),
( '2024-01-14', 2, 'T200', 'PHYSIOTHERAPIST');