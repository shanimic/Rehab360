SELECT
    s.patient_id,
    ru.first_name,
    ru.last_name,
    s.medical_diagnosis
FROM sessions s
JOIN registered_users ru
    ON ru.user_id = s.patient_id
   AND ru.user_role = s.patient_role
WHERE s.therapist_id = :therapist_id
  AND s.therapist_role = :therapist_role
  AND s.visit_type = :visit_type
  AND s.patient_role = 'PATIENT'
  AND CONCAT(s.visit_date, ' ', s.visit_time) = (
      SELECT MAX(CONCAT(s2.visit_date, ' ', s2.visit_time))
      FROM sessions s2
      WHERE s2.patient_id = s.patient_id
        AND s2.patient_role = 'PATIENT'
        AND s2.therapist_id = :therapist_id
        AND s2.therapist_role = :therapist_role
        AND s2.visit_type = :visit_type
  )
ORDER BY
    s.visit_date DESC,
    s.visit_time DESC;