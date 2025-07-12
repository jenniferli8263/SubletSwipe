from fastapi import APIRouter, HTTPException, status
from models import SwipeCreate
from db import get_pool

router = APIRouter()

@router.post("/swipes/listing/{listing_id}", status_code=status.HTTP_201_CREATED)
async def create_swipe(listing_id: int, swipe: SwipeCreate):
    query = """
        INSERT INTO listing_on_renter (listing_id, renter_profile_id, is_right)
        VALUES ($1, $2, $3)
        ON CONFLICT (listing_id, renter_profile_id) DO UPDATE
        SET is_right = EXCLUDED.is_right
        RETURNING id
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        try:
            row = await connection.fetchrow(
                query,
                listing_id,
                swipe.target_id,
                swipe.is_right
            )
            return {"message": "Listing swipe recorded", "id": row["id"]}
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to record listing swipe: {str(e)}"
            )


@router.post("/swipes/renter/{renter_profile_id}", status_code=status.HTTP_201_CREATED)
async def create_swipe(renter_profile_id: int, swipe: SwipeCreate):
    query = """
        INSERT INTO renter_on_listing (renter_profile_id, listing_id, is_right)
        VALUES ($1, $2, $3)
        ON CONFLICT (renter_profile_id, listing_id) DO UPDATE
        SET is_right = EXCLUDED.is_right
        RETURNING id
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        try:
            row = await connection.fetchrow(
                query,
                renter_profile_id,
                swipe.target_id,
                swipe.is_right
            )
            return {"message": "Renter swipe recorded", "id": row["id"]}
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to record renter swipe: {str(e)}"
            )
