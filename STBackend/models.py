from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    non_binary = "non-binary"
    prefer_not_to_say = "prefer not to say"
    other = "other"

class Photo(BaseModel):
    url: str
    label: Optional[str] = None

class ListingCreate(BaseModel):
    user_id: int
    is_active: Optional[bool] = True
    location_id: int
    start_date: date
    end_date: date
    tenant_age: int 
    tenant_gender: GenderEnum 
    asking_price: float
    building_type_id: Optional[int] = None
    num_bedrooms: int
    num_bathrooms: int
    pet_friendly: bool
    utilities_incl: bool
    description: Optional[str] = None
    amenities: Optional[List[int]] = []
    photos: Optional[List[Photo]] = []

