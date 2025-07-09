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
    SELECT * FROM renter_profiles WHERE id = $1
)
SELECT
    lc.id,
    lc.asking_price,
    lc.num_bedrooms,
    lc.num_bathrooms,
    lc.start_date,
    lc.end_date,
    lc.address_string,
    bt.type as building_type,
    lister.first_name as lister_name,
    photo.url as photo_url,
    photo.label as photo_label,
    (
        p.base_score *
        POWER(p.distance_factor_base, lc.distance_km) *
        POWER(p.price_factor_base,
            (lc.asking_price + CASE WHEN lc.utilities_incl THEN 0 ELSE p.utilities_adjustment END) - r.budget) *
        POWER(p.bathroom_factor_base, (lc.num_bathrooms - r.num_bathrooms)) *
        CASE WHEN lc.building_type_id = r.building_type_id THEN p.building_type_factor ELSE 1 END *
        CASE WHEN lc.target_gender IS NULL OR lc.target_gender = r.gender THEN p.gender_factor ELSE 1 END
    ) AS score
FROM get_listing_candidates($1) lc
JOIN renter r ON TRUE
JOIN score_params p ON TRUE
JOIN building_types bt ON lc.building_type_id = bt.id
LEFT JOIN LATERAL (
    SELECT url, label
    FROM photos
    WHERE photos.listing_id = lc.id
    LIMIT 1
) AS photo ON TRUE
LEFT JOIN LATERAL (
    SELECT first_name
    FROM users
    WHERE users.id = lc.user_id
    LIMIT 1
) AS lister ON TRUE
ORDER BY score DESC;
    """

    pool = await get_pool()
    async with pool.acquire() as connection:
        rows = await connection.fetch(query, renter_id)
        if not rows:
            return {"matches": [], "message": "No matches found for this renter"}
        
        matches = [dict(row) for row in rows]
        return {"matches": matches, "count": len(matches)}

"""

id bigint,
    id bigint,
    is_active boolean,
    asking_price numeric,
    num_bedrooms integer,
    num_bathrooms integer,
    start_date date,
    end_date date,
    pet_friendly boolean,
    utilities_incl boolean,
    locations_id bigint,
    building_type_id integer,
    target_gender gender_enum,
    address_string character varying(255),
    distance_km double precision
"""