from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.cloudinary_utils import delete_photo
from typing import List

router = APIRouter()

class PhotoDeleteRequest(BaseModel):
    public_ids: List[str]

@router.post("/photos/delete")
async def delete_cloudinary_photos(payload: PhotoDeleteRequest):
    print("Received delete request for:", payload.public_ids)
    
    try:
        failed = []
        for public_id in payload.public_ids:
            result = delete_photo(public_id)
            if result.get("result") != "ok":
                failed.append(public_id)

        if failed:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete some photos: {failed}"
            )

        return {"message": "Photos deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

