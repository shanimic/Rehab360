-- ============================================================
-- AI Search — SQL Queries
-- Tables: queries, content, saved_content
-- ============================================================


-- ----------------------------------------------------------------
-- QUERIES (search history)
-- ----------------------------------------------------------------

-- 1. Insert a new search query
INSERT INTO queries (query_text, query_date, user_id, user_role)
VALUES (%s, CURDATE(), %s, %s);

-- 2. Get the generated query_id after insert
SELECT LAST_INSERT_ID() AS query_id;

-- 3. Get query history for a user, newest first
SELECT query_id, query_text, query_date
FROM queries
WHERE user_id = %s
ORDER BY query_id DESC;


-- ----------------------------------------------------------------
-- DELETE QUERY (cascade in FK-safe order)
-- ----------------------------------------------------------------

-- 4. Delete saved_content rows linked to the query's content
DELETE rc
FROM saved_content rc
JOIN content c ON rc.content_id = c.content_id
WHERE c.query_id = %s;

-- 5. Delete all content rows for the query
DELETE FROM content
WHERE query_id = %s;

-- 6. Delete the query itself
DELETE FROM queries
WHERE query_id = %s;


-- ----------------------------------------------------------------
-- CONTENT
-- ----------------------------------------------------------------

-- 7. Insert a content row (source card returned by Gemini)
INSERT INTO content
    (content_title, content_source_link, content_text, content_type, query_id)
VALUES (%s, %s, %s, %s, %s);

-- 8. Get the generated content_id after insert
SELECT LAST_INSERT_ID() AS content_id;

-- 9. Find an existing content row by URL (duplicate guard on save)
SELECT content_id
FROM content
WHERE content_source_link = %s
LIMIT 1;


-- ----------------------------------------------------------------
-- SAVED CONTENT
-- ----------------------------------------------------------------

-- 10. Save a content row for a user
INSERT INTO saved_content (saving_date, content_id, user_id, user_role)
VALUES (CURDATE(), %s, %s, %s);

-- 11. Get the generated saving_id after insert
SELECT LAST_INSERT_ID() AS saving_id;

-- 12. Get all saved content for a user, newest first
SELECT
    rc.saving_id,
    rc.content_id,
    c.query_id,
    c.content_title,
    c.content_source_link                              AS source_url,
    c.content_text,
    c.content_type,
    COALESCE(uv.physio_verification_count,  0)         AS physio_verification_count,
    COALESCE(uv.trainer_verification_count, 0)         AS trainer_verification_count,
    rc.saving_date                                     AS created_at
FROM saved_content rc
JOIN content c ON rc.content_id = c.content_id
LEFT JOIN url_verifications uv ON uv.url = c.content_source_link
WHERE rc.user_id = %s
ORDER BY rc.saving_id DESC;

-- 13. Check if a user already saved a specific content row (duplicate guard)
SELECT saving_id
FROM saved_content
WHERE content_id = %s
  AND user_id = %s
LIMIT 1;

-- 14. Get content_id for a saving row (used before unsave to check orphan)
SELECT content_id
FROM saved_content
WHERE saving_id = %s;

-- 15. Delete a saved_content entry (unsave)
DELETE FROM saved_content
WHERE saving_id = %s;

-- 16. Count remaining saves for a content row (orphan check after unsave)
SELECT COUNT(*) AS ref_count
FROM saved_content
WHERE content_id = %s;

-- 17. Delete a content row with no remaining saves (orphan cleanup)
DELETE FROM content
WHERE content_id = %s;


-- ----------------------------------------------------------------
-- VERIFICATION (url_verifications — one authoritative row per URL)
-- ----------------------------------------------------------------

-- 19. Increment physio verification count for a URL
INSERT INTO url_verifications (url, physio_verification_count)
VALUES (%s, 1)
ON DUPLICATE KEY UPDATE physio_verification_count = physio_verification_count + 1;

-- 20. Decrement physio verification count (floor at 0)
INSERT INTO url_verifications (url, physio_verification_count)
VALUES (%s, 0)
ON DUPLICATE KEY UPDATE physio_verification_count = GREATEST(physio_verification_count - 1, 0);

-- 21. Increment trainer verification count for a URL
INSERT INTO url_verifications (url, trainer_verification_count)
VALUES (%s, 1)
ON DUPLICATE KEY UPDATE trainer_verification_count = trainer_verification_count + 1;

-- 22. Decrement trainer verification count (floor at 0)
INSERT INTO url_verifications (url, trainer_verification_count)
VALUES (%s, 0)
ON DUPLICATE KEY UPDATE trainer_verification_count = GREATEST(trainer_verification_count - 1, 0);

-- 23. Get all URLs with at least one verification (annotates search results)
SELECT url, physio_verification_count, trainer_verification_count
FROM url_verifications
WHERE physio_verification_count > 0
   OR trainer_verification_count > 0;
