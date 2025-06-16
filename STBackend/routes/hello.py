from fastapi import APIRouter, HTTPException
from db import get_pool

router = APIRouter()

@router.get("/hello")
async def say_hello():
    pool = await get_pool()
    async with pool.acquire() as connection:
        try:
            row = await connection.fetchrow("SELECT NOW()")
            return {
                "message": "Hello, world!",
                "timestamp": row["now"].isoformat()  # Return ISO 8601 formatted timestamp
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
