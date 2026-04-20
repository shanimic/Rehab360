-- Profile info for any user role
SELECT
    first_name,
    last_name,
    email,
    phone,
    birth_date,
    license_number
FROM registered_users
WHERE user_id = ?;