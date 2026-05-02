USE rehab360;

-- 1. Get treatment plan context by session_id
SELECT
    session_id,
    medical_diagnosis,
    visit_type
FROM sessions
WHERE session_id = %s
  AND session_status = 'ACTIVE';


-- 2. Get physiotherapy exercises for Add Exercise popup
SELECT
    exercise_id,
    exercise_name
FROM exercises
WHERE visit_type = 'PHYSIOTHERAPIST'
ORDER BY exercise_name ASC;


-- 3. Check if treatment plan already exists for session
SELECT
    plan_id
FROM plans
WHERE session_id = %s
LIMIT 1;


-- 4. Create treatment plan
INSERT INTO plans (
    session_id,
    goal,
    start_date,
    end_date,
    notes
)
VALUES (
    %s,
    %s,
    %s,
    %s,
    %s
);


-- 5. Get created plan_id
SELECT LAST_INSERT_ID() AS plan_id;


-- 6. Add selected exercise to treatment plan
INSERT INTO plan_exercises (
    plan_id,
    session_id,
    exercise_id,
    reps,
    num_sets,
    weight,
    time_duration,
    time_unit,
    description
)
VALUES (
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s
);