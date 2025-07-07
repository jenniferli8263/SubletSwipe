from fastapi import APIRouter, HTTPException, status
from db import get_pool

router = APIRouter()

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE id = $1 RETURNING *"

    pool = await get_pool()
    try:
        async with pool.acquire() as connection:
            async with connection.transaction():
                row = await connection.fetchrow(query, user_id)
                if not row:
                    raise HTTPException(status_code=404, detail="User not found")
                return {"message": "User deleted successfully", "deleted_user": dict(row)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
