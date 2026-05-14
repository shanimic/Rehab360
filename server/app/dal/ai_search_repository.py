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
                    c.content_source_link   AS source_url,
                    c.content_text,
                    c.content_type,
                    c.physio_verification_count,
                    c.trainer_verification_count,
                    rc.saving_date          AS created_at
                FROM saved_content rc
                JOIN content c ON rc.content_id = c.content_id
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

    async def update_verified_flag(
        self, url: str, user_role: str, value: bool
    ) -> None:
        """Increment or decrement the verification count for a professional's role on all content rows for a URL.

        Updates every content row sharing the same source URL so that verification
        propagates to all users who saved the same link under different queries.

        Args:
            url: The source URL whose content rows should be updated.
            user_role: 'PHYSIOTHERAPIST' or 'FITNESS_TRAINER'.
            value: True to increment, False to decrement (floored at 0).
        """
        if user_role == "PHYSIOTHERAPIST":
            column = "physio_verification_count"
        else:
            column = "trainer_verification_count"

        if value:
            query = f"UPDATE content SET {column} = {column} + 1 WHERE content_source_link = %s"
        else:
            query = (
                f"UPDATE content SET {column} = GREATEST({column} - 1, 0) "
                f"WHERE content_source_link = %s"
            )

        await self.cursor.execute(query=query, args=(url,))

    async def get_verified_content_url_flags(self) -> dict[str, dict[str, int]]:
        """Return verification counts for all URLs verified by at least one professional.

        Returns:
            A dict mapping source URL to {'physio': int, 'trainer': int}.
        """
        await self.cursor.execute(
            query="""
                SELECT content_source_link, physio_verification_count, trainer_verification_count
                FROM content
                WHERE physio_verification_count > 0 OR trainer_verification_count > 0
            """
        )
        rows = await self.cursor.fetchall()
        return {
            row["content_source_link"]: {
                "physio": row["physio_verification_count"],
                "trainer": row["trainer_verification_count"],
            }
            for row in rows
        }

    async def update_content_metadata(
        self, content_id: int, title: str, content_text: str | None, content_type: str
    ) -> None:
        """Backfill title, text, and type on a skeleton content row (created by verify).

        Only updates rows where content_title is empty, so patient saves after a
        professional verify produce a fully populated card.

        Args:
            content_id: The content row to update.
            title: The real content title.
            content_text: The real description text, or None.
            content_type: The real content type string.
        """
        await self.cursor.execute(
            query="""
                UPDATE content
                SET content_title = %s, content_text = %s, content_type = %s
                WHERE content_id = %s AND content_title = ''
            """,
            args=(title, content_text, content_type, content_id),
        )

    async def get_verification_flags_by_url(self, url: str) -> dict[str, int]:
        """Return the max verification counts for a URL across all content rows.

        Args:
            url: The source URL to look up.

        Returns:
            A dict with 'physio' and 'trainer' int counts.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    COALESCE(MAX(physio_verification_count), 0) AS physio,
                    COALESCE(MAX(trainer_verification_count), 0) AS trainer
                FROM content
                WHERE content_source_link = %s
            """,
            args=(url,),
        )
        row = await self.cursor.fetchone()
        return {"physio": row["physio"], "trainer": row["trainer"]}

    async def set_content_verification_counts(
        self, content_id: int, physio_count: int, trainer_count: int
    ) -> None:
        """Directly set verification counts on a specific content row.

        Used when propagating existing URL verification to a newly inserted content row.

        Args:
            content_id: The content row to update.
            physio_count: The physio verification count to apply.
            trainer_count: The trainer verification count to apply.
        """
        await self.cursor.execute(
            query="""
                UPDATE content
                SET physio_verification_count = %s, trainer_verification_count = %s
                WHERE content_id = %s
            """,
            args=(physio_count, trainer_count, content_id),
        )

    async def get_content_by_url_and_query(
        self, url: str, query_id: int
    ) -> dict | None:
        """Find an existing content row by URL and query.

        Args:
            url: The content source URL to look up.
            query_id: The query the content belongs to.

        Returns:
            A dict with content_id, or None if not found.
        """
        await self.cursor.execute(
            query="""
                SELECT content_id
                FROM content
                WHERE content_source_link = %s AND query_id = %s
                LIMIT 1
            """,
            args=(url, query_id),
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
