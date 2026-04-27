USE rehab360;

SELECT
    -- פרטי המטופל
    u.user_id AS patient_id,
    u.first_name AS patient_first_name,
    u.last_name AS patient_last_name,
    u.phone,
    u.birth_date,
    u.email
FROM registered_users u
WHERE u.user_id = ?
  AND u.user_role = 'PATIENT';
  
  
  INSERT INTO sessions (
    -- הכנסת סיכום ביקור חדש
    visit_date,
    visit_time,
    visit_type,
    treatment_area,
    medical_diagnosis,
    description,
    recommendations,
    patient_id,
    patient_role,
    therapist_id,
    therapist_role,
    session_status
)
VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, 'PATIENT', %s, %s,'ACTIVE'
);