from fastapi import APIRouter, status
from db import get_pool

router = APIRouter()

@router.get("/mutual-matches/renter/{renter_profile_id}", status_code=status.HTTP_200_OK)
async def get_mutual_match_listing_ids(renter_profile_id: int):
    query = """
        SELECT listing_id
        FROM mutual_matches
        WHERE renter_profile_id = $1;
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        rows = await connection.fetch(query, renter_profile_id)
        listing_ids = [row["listing_id"] for row in rows]
        return {"listing_ids": listing_ids}

@router.get("/mutual-matches/listing/{listing_id}", status_code=status.HTTP_200_OK)
async def get_mutual_match_renters(listing_id: int):
    query = """
        SELECT renter_profile_id
        FROM mutual_matches
        WHERE listing_id = $1;
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        rows = await connection.fetch(query, listing_id)
        renter_ids = [row["renter_profile_id"] for row in rows]
        return {"renter_profile_ids": renter_ids}
