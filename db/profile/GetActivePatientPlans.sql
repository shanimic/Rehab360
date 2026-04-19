-- Active plans with per-plan completion % for a patient
SELECT
    p.plan_id,
    p.goal,
    s.visit_type AS category,
    p.start_date,
    p.end_date,
    ROUND(
        COALESCE(
            (SELECT SUM(ec.num_exe_completed)
             FROM exercise_completion ec
             WHERE ec.plan_id = p.plan_id
               AND ec.session_id = p.session_id),
            0
        ) / NULLIF(
            (SELECT SUM(pe.reps * pe.num_sets * pe.time_duration *
                        (CASE pe.time_unit WHEN 'Weekly' THEN 1 ELSE 7 END))
             FROM plan_exercises pe
             WHERE pe.plan_id = p.plan_id
               AND pe.session_id = p.session_id)
            * NULLIF(TIMESTAMPDIFF(WEEK, p.start_date, p.end_date), 0),
            0
        ) * 100,
    1) AS completion_percent
FROM plans p
JOIN sessions s ON p.session_id = s.session_id
WHERE s.patient_id = ?
  AND s.session_status = 'ACTIVE';