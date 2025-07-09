from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
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
    label: str

class ListingCreate(BaseModel):
    user_id: int
    is_active: Optional[bool] = True
    raw_address: str # raw address to be verified
    locations_id: Optional[int] = None # will be set by the backend after we add a row
    start_date: date
    end_date: date
    target_gender: GenderEnum
    asking_price: float
    building_type_id: Optional[int] = None
    num_bedrooms: int
    num_bathrooms: int
    pet_friendly: bool
    utilities_incl: bool
    description: Optional[str] = None
    amenities: Optional[List[int]] = []
    photos: Optional[List[Photo]] = []

class ListingUpdate(BaseModel):
    is_active: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_gender: Optional[GenderEnum] = None
    asking_price: Optional[float] = None
    num_bedrooms: Optional[int] = None
    num_bathrooms: Optional[int] = None
    pet_friendly: Optional[bool] = None
    utilities_incl: Optional[bool] = None
    description: Optional[str] = None
    amenities: Optional[List[int]] = None
    photos_to_add: Optional[List[Photo]] = None
    photos_to_delete: Optional[List[str]] = None

class UserCreate(BaseModel):
    id: int
    first_name: str
    last_name: str
    password: str = Field(..., min_length=8)
    email: EmailStr
    profile_photo: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    profile_photo: Optional[str] = None
