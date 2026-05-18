SELECT
    p.plan_id,
    p.session_id,
    s.medical_diagnosis,
    p.start_date,
    p.end_date,
    COALESCE(
        (
            EXE_COMPLETED.EXECOMP /
            (
                NUM_EXE_PER_W.NEPW *
                NUM_WEEKS.weeks_diff
            )
        ) * 100,
        0
    ) AS progress_percentage,
    EXE_COMPLETED.last_progress_update
FROM plans p
JOIN sessions s
  ON s.session_id = p.session_id

CROSS JOIN (
    SELECT
        SUM(
            pe.reps *
            pe.num_sets *
            pe.time_duration *
            (CASE pe.time_unit WHEN 'Weekly' THEN 1 ELSE 7 END)
        ) AS NEPW
    FROM plan_exercises pe
    JOIN sessions s2
      ON pe.session_id = s2.session_id
    WHERE s2.patient_id = %s
      AND s2.patient_role = 'PATIENT'
      AND s2.session_status = 'ACTIVE'
      AND s2.visit_type = %s
) AS NUM_EXE_PER_W

CROSS JOIN (
    SELECT
        TIMESTAMPDIFF(WEEK, p2.start_date, p2.end_date) AS weeks_diff
    FROM plans p2
    JOIN sessions s3
      ON p2.session_id = s3.session_id
    WHERE s3.patient_id = %s
      AND s3.patient_role = 'PATIENT'
      AND s3.session_status = 'ACTIVE'
      AND s3.visit_type = %s
    ORDER BY
        s3.visit_date DESC,
        s3.visit_time DESC,
        s3.session_id DESC
    LIMIT 1
) AS NUM_WEEKS

CROSS JOIN (
    SELECT
        SUM(ec.num_exe_completed) AS EXECOMP,
        MAX(ec.execution_date) AS last_progress_update
    FROM exercise_completion ec
    JOIN sessions s4
      ON ec.session_id = s4.session_id
    WHERE s4.patient_id = %s
      AND s4.patient_role = 'PATIENT'
      AND ec.execution_status = 1
      AND s4.session_status = 'ACTIVE'
      AND s4.visit_type = %s
) AS EXE_COMPLETED

WHERE s.patient_id = %s
  AND s.patient_role = 'PATIENT'
  AND s.session_status = 'ACTIVE'
  AND s.visit_type = %s

ORDER BY
    s.visit_date DESC,
    s.visit_time DESC,
    s.session_id DESC

LIMIT 1;