import asyncpg
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

_pool = None
_lock = asyncio.Lock()

async def get_pool():
    global _pool
    if _pool is None:
        async with _lock:
            if _pool is None:
                _pool = await asyncpg.create_pool(dsn=DATABASE_URL)
    return _pool

async def init_db():
    await get_pool()

async def close_db():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
