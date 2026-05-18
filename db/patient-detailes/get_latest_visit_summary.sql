SELECT
    s.session_id,
    s.visit_date,
    s.visit_time,
    s.visit_type,
    s.description,
    CONCAT(t.first_name, ' ', t.last_name) AS therapist_name
FROM sessions s
JOIN registered_users t
  ON t.user_id = s.therapist_id
 AND t.user_role = s.therapist_role
WHERE s.patient_id = %s
  AND s.patient_role = 'PATIENT'
  AND s.session_status = 'ACTIVE'
ORDER BY
    s.visit_date DESC,
    s.visit_time DESC,
    s.session_id DESC
LIMIT 1;