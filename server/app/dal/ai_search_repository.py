from dataclasses import dataclass

from aiomysql import DictCursor


@dataclass
class ContentData:
    """Payload for inserting a content row."""

    title: str
    url: str
    content_text: str | None
    content_type: str
    query_id: int


class AiSearchRepository:
    """Data access layer for AI search operations."""

    def __init__(self, db: DictCursor) -> None:
        self.cursor = db

    async def insert_query(self, query_text: str, user_id: str, user_role: str) -> int:
        """Insert a new search query and return its generated ID.

        Args:
            query_text: The user's natural language query.
            user_id: The ID of the user submitting the query.
            user_role: The role of the user submitting the query.

        Returns:
            The generated query_id.
        """
        await self.cursor.execute(
            query="""
                INSERT INTO queries (query_text, query_date, user_id, user_role)
                VALUES (%s, CURDATE(), %s, %s)
            """,
            args=(query_text, user_id, user_role),
        )
        await self.cursor.execute("SELECT LAST_INSERT_ID() AS query_id")
        row = await self.cursor.fetchone()
        return row["query_id"]

    async def get_queries_by_user(self, user_id: str) -> list[dict]:
        """Fetch all queries submitted by a user, newest first.

        Args:
            user_id: The ID of the user.

        Returns:
            A list of dicts with query_id, query_text, and query_date.
        """
        await self.cursor.execute(
            query="""
                SELECT query_id, query_text, query_date
                FROM queries
                WHERE user_id = %s
                ORDER BY query_id DESC
            """,
            args=(user_id,),
        )
        return await self.cursor.fetchall()

    async def delete_query_cascade(self, query_id: int) -> None:
        """Delete a query and all its associated content in FK-safe order.

        Args:
            query_id: The ID of the query to delete.
        """
        await self.cursor.execute(
            query="""
                DELETE rc FROM saved_content rc
                JOIN content c ON rc.content_id = c.content_id
                WHERE c.query_id = %s
            """,
            args=(query_id,),
        )
        await self.cursor.execute(
            query="DELETE FROM content WHERE query_id = %s",
            args=(query_id,),
        )
        await self.cursor.execute(
            query="DELETE FROM queries WHERE query_id = %s",
            args=(query_id,),
        )

    async def insert_content(self, data: ContentData) -> int:
        """Insert a content row and return its generated ID.

        Args:
            data: A ContentData instance with title, url, content_text, content_type, query_id.

        Returns:
            The generated content_id.
        """
        await self.cursor.execute(
            query="""
                INSERT INTO content
                    (content_title, content_source_link, content_text, content_type, query_id)
                VALUES (%s, %s, %s, %s, %s)
            """,
            args=(data.title, data.url, data.content_text, data.content_type, data.query_id),
        )
        await self.cursor.execute("SELECT LAST_INSERT_ID() AS content_id")
        row = await self.cursor.fetchone()
        return row["content_id"]

    async def insert_saved_content(
        self, content_id: int, user_id: str, user_role: str
    ) -> int:
        """Insert a saved_content row and return its generated ID.

        Args:
            content_id: The content being saved.
            user_id: The user saving this content.
            user_role: The role of the user saving this content.

        Returns:
            The generated saving_id.
        """
        await self.cursor.execute(
            query="""
                INSERT INTO saved_content
                    (saving_date, content_id, user_id, user_role)
                VALUES (CURDATE(), %s, %s, %s)
            """,
            args=(content_id, user_id, user_role),
        )
        await self.cursor.execute(
            "SELECT LAST_INSERT_ID() AS saving_id"
        )
        row = await self.cursor.fetchone()
        return row["saving_id"]

    async def get_saved_content_by_user(self, user_id: str) -> list[dict]:
        """Fetch all saved content for a user, newest first.

        Args:
            user_id: The ID of the user.

        Returns:
            A list of dicts matching the SavedContentItem shape.
        """
        await self.cursor.execute(
            query="""
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
                ORDER BY rc.saving_id DESC
            """,
            args=(user_id,),
        )
        return await self.cursor.fetchall()

    async def delete_saved_content(self, saving_id: int) -> None:
        """Remove a saved content entry, and delete the content row if unreferenced.

        Args:
            saving_id: The ID of the saved content entry to remove.
        """
        await self.cursor.execute(
            query="""
                SELECT content_id FROM saved_content
                WHERE saving_id = %s
            """,
            args=(saving_id,),
        )
        row = await self.cursor.fetchone()
        if not row:
            return

        content_id = row["content_id"]

        await self.cursor.execute(
            query="DELETE FROM saved_content WHERE saving_id = %s",
            args=(saving_id,),
        )

        await self.cursor.execute(
            query="""
                SELECT COUNT(*) AS ref_count FROM saved_content
                WHERE content_id = %s
            """,
            args=(content_id,),
        )
        ref_row = await self.cursor.fetchone()
        if ref_row["ref_count"] == 0:
            await self.cursor.execute(
                query="DELETE FROM content WHERE content_id = %s",
                args=(content_id,),
            )

    async def upsert_url_verification(
        self, url: str, user_role: str, increment: bool
    ) -> None:
        """Increment or decrement the verification count for a URL in url_verifications.

        Args:
            url: The source URL to update.
            user_role: 'PHYSIOTHERAPIST' or 'FITNESS_TRAINER'.
            increment: True to increment, False to decrement (floored at 0).
        """
        column = (
            "physio_verification_count"
            if user_role == "PHYSIOTHERAPIST"
            else "trainer_verification_count"
        )
        if increment:
            query = f"""
                INSERT INTO url_verifications (url, {column})
                VALUES (%s, 1)
                ON DUPLICATE KEY UPDATE {column} = {column} + 1
            """
        else:
            query = f"""
                INSERT INTO url_verifications (url, {column})
                VALUES (%s, 0)
                ON DUPLICATE KEY UPDATE {column} = GREATEST({column} - 1, 0)
            """
        await self.cursor.execute(query=query, args=(url,))

    async def get_all_url_verifications(self) -> dict[str, dict[str, int]]:
        """Return verification counts for all URLs verified by at least one professional.

        Returns:
            A dict mapping source URL to {'physio': int, 'trainer': int}.
        """
        await self.cursor.execute(
            query="""
                SELECT url, physio_verification_count, trainer_verification_count
                FROM url_verifications
                WHERE physio_verification_count > 0
                   OR trainer_verification_count > 0
            """
        )
        rows = await self.cursor.fetchall()
        return {
            row["url"]: {
                "physio": row["physio_verification_count"],
                "trainer": row["trainer_verification_count"],
            }
            for row in rows
        }

    async def get_content_by_url(self, url: str) -> dict | None:
        """Find an existing content row by URL.

        Args:
            url: The content source URL to look up.

        Returns:
            A dict with content_id, or None if not found.
        """
        await self.cursor.execute(
            query="""
                SELECT content_id
                FROM content
                WHERE content_source_link = %s
                LIMIT 1
            """,
            args=(url,),
        )
        return await self.cursor.fetchone()

    async def get_recommendation_by_content_and_user(
        self, content_id: int, user_id: str
    ) -> dict | None:
        """Find an existing saved content row for a given content and user.

        Args:
            content_id: The content to look up.
            user_id: The user to look up.

        Returns:
            A dict with saving_id, or None if not found.
        """
        await self.cursor.execute(
            query="""
                SELECT saving_id
                FROM saved_content
                WHERE content_id = %s AND user_id = %s
                LIMIT 1
            """,
            args=(content_id, user_id),
        )
        return await self.cursor.fetchone()
