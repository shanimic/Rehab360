SELECT
    user_id AS patient_id,
    first_name,
    last_name
FROM registered_users
WHERE user_role = 'PATIENT'
ORDER BY
    first_name ASC,
    last_name ASC;