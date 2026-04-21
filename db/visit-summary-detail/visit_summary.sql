USE rehab360;
SELECT 
    -- פרטי המטופל
    u_patient.user_id AS patient_id,
    u_patient.first_name AS patient_first_name,
    u_patient.last_name AS patient_last_name,
    u_patient.phone,
    u_patient.birth_date,
    u_patient.email,

    -- פרטי המפגש
    s.session_id,
    s.visit_date, 
    s.visit_time, 
    s.visit_type, 
    s.treatment_area, 
    s.medical_diagnosis, 
    s.description, 
    s.recommendations,

    -- פרטי המטפל
    u_therapist.first_name AS therapist_first_name,
    u_therapist.last_name AS therapist_last_name,
    s.therapist_role,

    -- לחיצה על כפתור צפייה בתוכנית טיפול
    p.plan_id

FROM sessions s

JOIN registered_users u_patient 
    ON s.patient_id = u_patient.user_id 
   AND s.patient_role = u_patient.user_role

JOIN registered_users u_therapist 
    ON s.therapist_id = u_therapist.user_id 
   AND s.therapist_role = u_therapist.user_role

LEFT JOIN plans p 
    ON s.session_id = p.session_id

WHERE s.session_id = ?;