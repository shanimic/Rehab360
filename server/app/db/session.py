from typing import AsyncGenerator

from aiomysql import Pool, DictCursor, create_pool
import asyncio

import aiomysql
from app.core.config import settings

class Database:
    _pool: Pool | None = None
    _lock = asyncio.Lock()

    @classmethod
    async def get_pool(cls) -> Pool:
        """Returns the pool, creating it if it doesn't exist."""
        if cls._pool is None:
            async with cls._lock:
                if cls._pool is None:
                    cls._pool = await create_pool(
                        host=settings.DB_HOST,
                        user=settings.DB_USER,
                        password=settings.DB_PASSWORD,
                        db=settings.DB_NAME,
                        autocommit=True,
                        minsize=1,
                        maxsize=10
                    )
        return cls._pool

async def get_db() -> AsyncGenerator[DictCursor, None]:
    """
    FastAPI Dependency: yields a dictionary-based cursor.
    The 'None' indicates that the generator doesn't 'receive' 
    any values back via .send()
    """
    pool = await Database.get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(DictCursor) as cur:
            yield cur