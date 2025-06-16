from fastapi import APIRouter, HTTPException, status
from models import Photo, ListingCreate
from db import get_pool

router = APIRouter()

async def insert_listing_amenities(connection, listing_id: int, amenities: list[int]):
    if not amenities:
        return

    rows = [(listing_id, amenity_id) for amenity_id in amenities]

    # We can also make bulk insert for this
    # The assumption though is that there won't be thousands of amenities. Leave this for now
    await connection.executemany("""
        INSERT INTO listing_amenities (listing_id, amenity_id)
        VALUES ($1, $2)
    """, rows)

async def insert_listing_photos_bulk(connection, listing_id: int, photos: list[Photo]):
    if not photos:
        return

    values_clause = ", ".join(
        f"(${i * 3 + 1}, ${i * 3 + 2}, ${i * 3 + 3})" for i in range(len(photos))
    )

    insert_query = f"""
        INSERT INTO photos (listing_id, url, label)
        VALUES {values_clause}
    """

    args = []
    for photo in photos:
        args.extend([listing_id, photo.url, photo.label])

    await connection.execute(insert_query, *args)

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
            listing_id = row["id"]

            # add amenities
            await insert_listing_amenities(connection, listing_id, listing.amenities)

            # add photos
            await insert_listing_photos_bulk(connection, listing_id, listing.photos)

            return listing_id


@router.post("/listings", status_code=status.HTTP_201_CREATED)
async def create_listing(listing: ListingCreate):
    try:
        new_id = await insert_listing(listing)
        return {"message": "Listing created", "id": new_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database error: {str(e)}")
