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

-- 9. Backfill title, text, and type on a skeleton content row
--    (only updates rows where title is empty — created by a verify before a save)
UPDATE content
SET content_title = %s,
    content_text  = %s,
    content_type  = %s
WHERE content_id = %s
  AND content_title = '';

-- 10. Find an existing content row by URL and query (duplicate guard)
SELECT content_id
FROM content
WHERE content_source_link = %s
  AND query_id = %s
LIMIT 1;


-- ----------------------------------------------------------------
-- SAVED CONTENT
-- ----------------------------------------------------------------

-- 11. Save a content row for a user
INSERT INTO saved_content (saving_date, content_id, user_id, user_role)
VALUES (CURDATE(), %s, %s, %s);

-- 12. Get the generated saving_id after insert
SELECT LAST_INSERT_ID() AS saving_id;

-- 13. Get all saved content for a user, newest first
SELECT
    rc.saving_id,
    rc.content_id,
    c.query_id,
    c.content_title,
    c.content_source_link               AS source_url,
    c.content_text,
    c.content_type,
    c.physio_verification_count,
    c.trainer_verification_count,
    rc.saving_date                      AS created_at
FROM saved_content rc
JOIN content c ON rc.content_id = c.content_id
WHERE rc.user_id = %s
ORDER BY rc.saving_id DESC;

-- 14. Check if a user already saved a specific content row (duplicate guard)
SELECT saving_id
FROM saved_content
WHERE content_id = %s
  AND user_id = %s
LIMIT 1;

-- 15. Get content_id for a saving row (used before unsave to check orphan)
SELECT content_id
FROM saved_content
WHERE saving_id = %s;

-- 16. Delete a saved_content entry (unsave)
DELETE FROM saved_content
WHERE saving_id = %s;

-- 17. Count remaining saves for a content row (orphan check after unsave)
SELECT COUNT(*) AS ref_count
FROM saved_content
WHERE content_id = %s;

-- 18. Delete a content row with no remaining saves (orphan cleanup)
DELETE FROM content
WHERE content_id = %s;


-- ----------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------

-- 19. Increment physio verification count for all content rows at a URL
UPDATE content
SET physio_verification_count = physio_verification_count + 1
WHERE content_source_link = %s;

-- 20. Decrement physio verification count (floor at 0)
UPDATE content
SET physio_verification_count = GREATEST(physio_verification_count - 1, 0)
WHERE content_source_link = %s;

-- 21. Increment trainer verification count for all content rows at a URL
UPDATE content
SET trainer_verification_count = trainer_verification_count + 1
WHERE content_source_link = %s;

-- 22. Decrement trainer verification count (floor at 0)
UPDATE content
SET trainer_verification_count = GREATEST(trainer_verification_count - 1, 0)
WHERE content_source_link = %s;

-- 23. Get all URLs that have at least one verification (used on search to annotate sources)
SELECT content_source_link, physio_verification_count, trainer_verification_count
FROM content
WHERE physio_verification_count > 0
   OR trainer_verification_count > 0;

-- 24. Get max verification counts for a specific URL (used when saving content)
SELECT
    COALESCE(MAX(physio_verification_count),  0) AS physio,
    COALESCE(MAX(trainer_verification_count), 0) AS trainer
FROM content
WHERE content_source_link = %s;

-- 25. Set verification counts directly on a content row
--     (propagates existing URL verification to a newly inserted row)
UPDATE content
SET physio_verification_count  = %s,
    trainer_verification_count = %s
WHERE content_id = %s;
