from fastapi import APIRouter, HTTPException, status
from models import Photo, ListingCreate
from db import get_pool
import httpx
import os
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

router = APIRouter()

async def get_address_autocomplete_predictions(input: str):
    url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={input}&key={GOOGLE_API_KEY}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Failed to fetch from Google Places API")
            data = resp.json()
            if "status" not in data or data["status"] != "OK":
                raise HTTPException(status_code=400, detail=f"Google API failed: {data.get('status', 'No status')}")
            if "predictions" not in data:
                raise HTTPException(status_code=400, detail="No predictions in Google API response")
            return data["predictions"]
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"HTTPX error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/locations/{input}")
async def get_location_predictions(input: str):
    predictions = await get_address_autocomplete_predictions(input)
    # filter for only locations in Canada
    canadian = [
        p for p in predictions
        if any(term.get("value", "").lower() == "canada" for term in p.get("terms", []))
    ]
    return {"predictions": canadian}