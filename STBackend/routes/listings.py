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
            user_id, is_active, locations_id, start_date, end_date,
            target_gender, asking_price, building_type_id,
            num_bedrooms, num_bathrooms, pet_friendly,
            utilities_incl, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        async with connection.transaction():
            row = await connection.fetchrow(query,
                listing.user_id,
                listing.is_active,
                listing.locations_id,
                listing.start_date,
                listing.end_date,
                listing.target_gender.value,
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

@router.get("/listings/{listing_id}")
async def get_listing(listing_id: int):
    query = """
        SELECT 
            l.id,
            l.user_id,
            l.locations_id,
            u.first_name || ' ' || u.last_name AS poster_name,
            u.email AS poster_email,
            l.is_active,
            l.start_date,
            l.end_date,
            l.target_gender,
            l.asking_price,
            l.num_bedrooms,
            l.num_bathrooms,
            l.pet_friendly,
            l.utilities_incl,
            l.description,
            loc.address_string,
            loc.latitude,
            loc.longitude,
            bt.type AS building_type,
            COALESCE(
                (SELECT json_agg(json_build_object('url', p.url, 'label', p.label))
                 FROM photos p
                 WHERE p.listing_id = l.id), '[]'
            ) AS photos,
            COALESCE(
                (SELECT json_agg(a.name)
                 FROM listing_amenities la
                 JOIN amenities a ON la.amenity_id = a.id
                 WHERE la.listing_id = l.id), '[]'
            ) AS amenities
        FROM listings l
        JOIN users u ON l.user_id = u.id
        JOIN locations loc ON l.locations_id = loc.id
        LEFT JOIN building_types bt ON l.building_type_id = bt.id
        WHERE l.id = $1
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        row = await connection.fetchrow(query, listing_id)
        if not row:
            raise HTTPException(status_code=404, detail="Listing not found")
        return dict(row)
