from fastapi import APIRouter, HTTPException, status
from models import ListingCreate
from db import get_pool

router = APIRouter()

async def insert_listing(listing: ListingCreate) -> int:
    query = """
        INSERT INTO listings (
            user_id, location_id, start_date, end_date,
            tenant_age, tenant_gender,
            asking_price, building_type_id, num_bedrooms, num_bathrooms,
            pet_friendly, utilities_incl, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
    """
    pool = await get_pool()
    async with pool.acquire() as connection:
        async with connection.transaction():
            row = await connection.fetchrow(query,
                listing.user_id,
                listing.location_id,
                listing.start_date,
                listing.end_date,
                listing.tenant_age,
                listing.tenant_gender.value,
                listing.asking_price,
                listing.building_type_id,
                listing.num_bedrooms,
                listing.num_bathrooms,
                listing.pet_friendly,
                listing.utilities_incl,
                listing.description
            )
            if not row:
                raise RuntimeError("Insert succeeded but no ID returned.")
            return row["id"]

@router.post("/listings", status_code=status.HTTP_201_CREATED)
async def create_listing(listing: ListingCreate):
    try:
        new_id = await insert_listing(listing)
        return {"message": "Listing created", "id": new_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database error: {str(e)}")
