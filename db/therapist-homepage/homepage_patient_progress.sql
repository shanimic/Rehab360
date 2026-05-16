SELECT
    (EXE_COMPLETED.EXECOMP / (NUM_EXE_PER_W.NEPW * NUM_WEEKS.weeks_diff)) * 100 AS progress_percentage,
    EXE_COMPLETED.last_progress_update
FROM
(
    SELECT
        SUM(
            pe.reps * pe.num_sets * pe.time_duration *
            (CASE pe.time_unit WHEN 'Weekly' THEN 1 ELSE 7 END)
        ) AS NEPW
    FROM plan_exercises pe, sessions s
    WHERE pe.session_id = s.session_id
      AND s.patient_id = :patient_id
      AND s.session_status = 'ACTIVE'
      AND s.visit_type = :visit_type
) AS NUM_EXE_PER_W,

(
    SELECT
        TIMESTAMPDIFF(WEEK, p.start_date, p.end_date) AS weeks_diff
    FROM plans p, sessions s
    WHERE p.session_id = s.session_id
      AND s.patient_id = :patient_id
      AND s.session_status = 'ACTIVE'
      AND s.visit_type = :visit_type
) AS NUM_WEEKS,

(
    SELECT
        SUM(ec.num_exe_completed) AS EXECOMP,
        MAX(ec.execution_date) AS last_progress_update
    FROM exercise_completion ec, sessions s
    WHERE ec.session_id = s.session_id
      AND s.patient_id = :patient_id
      AND ec.execution_status = 1
      AND s.session_status = 'ACTIVE'
      AND s.visit_type = :visit_type
) AS EXE_COMPLETED;