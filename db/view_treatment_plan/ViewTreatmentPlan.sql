-- 1. Get treatment plan details by session_id
SELECT
    p.plan_id,
    p.session_id,
    s.medical_diagnosis,
    p.goal,
    p.start_date,
    p.end_date,
    p.notes
FROM plans p
JOIN sessions s
    ON p.session_id = s.session_id
WHERE p.session_id = %s
  AND s.session_status = 'ACTIVE'
LIMIT 1;


-- 2. Get treatment plan exercises by plan_id and session_id
SELECT
    pe.exercise_id,
    e.exercise_name,
    pe.reps,
    pe.num_sets,
    pe.weight,
    pe.time_duration,
    pe.time_unit,
    pe.description
FROM plan_exercises pe
JOIN exercises e
    ON pe.exercise_id = e.exercise_id
WHERE pe.plan_id = %s
  AND pe.session_id = %s
ORDER BY e.exercise_name ASC;