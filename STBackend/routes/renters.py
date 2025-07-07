from fastapi import APIRouter, HTTPException, status
from db import get_pool

router = APIRouter()

@router.get("/renters/{renter_id}/matches")
async def get_renter_matches(renter_id: int):
    query = """
    WITH score_params AS (
        SELECT
            100.0 AS base_score,
            1.01 AS distance_factor_base,
            0.995 AS price_factor_base,
            1.2 AS bathroom_factor_base,
            100 AS utilities_adjustment,
            1.2 AS building_type_factor,
            1.5 AS gender_factor
    ),
    renter AS (
        SELECT * FROM renter_profiles rp WHERE id = $1
    ),
    base_listings AS (
        SELECT l.* FROM listings l, renter r
        WHERE l.is_active
          AND (l.num_bedrooms = r.num_bedrooms)
          AND (r.start_date >= l.start_date - 5)
          AND (r.end_date <= l.end_date + 5)
          AND (r.has_pet <= l.pet_friendly)
          AND NOT EXISTS (
              SELECT 1 FROM renter_on_listing rol
              WHERE rol.renter_profile_id = $1
                AND rol.listing_id = l.id
          )
          AND NOT EXISTS (
              SELECT 1 FROM listing_on_renter lor
              WHERE lor.listing_id = l.id
                AND lor.renter_profile_id = $1
          )
    ),
    renter_location AS (
        SELECT loc.latitude AS ref_lat, loc.longitude AS ref_lon
        FROM renter_profiles r
        JOIN locations loc ON r.locations_id = loc.id
        WHERE r.id = $1
    ),
    by_location AS (
        SELECT
            base.*,
            loc.address_string,
            6371 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS(loc.latitude - rl.ref_lat) / 2), 2) +
                COS(RADIANS(rl.ref_lat)) * COS(RADIANS(loc.latitude)) *
                POWER(SIN(RADIANS(loc.longitude - rl.ref_lon) / 2), 2)
            )) AS distance_km
        FROM base_listings base
        JOIN locations loc ON base.locations_id = loc.id
        JOIN renter_location rl ON TRUE
    )
    SELECT
        r.budget,
        bl.*,
        (p.base_score *
            POWER(p.distance_factor_base, bl.distance_km) *
            POWER(p.price_factor_base, (
             (bl.asking_price + CASE WHEN bl.utilities_incl THEN 0 ELSE p.utilities_adjustment END) - r.budget)) *
            POWER(p.bathroom_factor_base, (bl.num_bathrooms - r.num_bathrooms)) *
            CASE WHEN bl.building_type_id = r.building_type_id THEN p.building_type_factor ELSE 1 END *
            CASE WHEN bl.target_gender IS NULL OR bl.target_gender = r.gender THEN p.gender_factor ELSE 1 END
        ) AS score
    FROM by_location bl, renter r, score_params p
    ORDER BY score DESC;
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        rows = await connection.fetch(query, renter_id)
        if not rows:
            return {"matches": [], "message": "No matches found for this renter"}
        
        matches = [dict(row) for row in rows]
        return {"matches": matches, "count": len(matches)}

