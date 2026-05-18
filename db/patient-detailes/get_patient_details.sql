SELECT
    ru.user_id,
    ru.first_name,
    ru.last_name,
    ru.phone,
    ru.birth_date,
    ru.email
FROM registered_users ru
WHERE ru.user_id = %s
  AND ru.user_role = 'PATIENT';