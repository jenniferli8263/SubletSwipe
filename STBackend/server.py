from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from db import init_db, close_db, get_pool
from routes import listings, hello, renters, auth, users, locations, mutualmatches
from typing import List
from pydantic import BaseModel

class Amenity(BaseModel):
    id: int
    name: str

class BuildingType(BaseModel):
    id: int
    type: str

class Gender(BaseModel):
    id: int
    gender: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB pool
    await init_db()
    yield
    # Shutdown: Close DB pool
    await close_db()

app = FastAPI(lifespan=lifespan)

app.include_router(listings.router)
app.include_router(auth.router)
app.include_router(hello.router)
app.include_router(renters.router)
app.include_router(users.router)
app.include_router(locations.router)
app.include_router(mutualmatches.router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/amenities", response_model=List[Amenity])
async def get_amenities():
    """
    Get all available amenities
    """
    pool = await get_pool()
    async with pool.acquire() as connection:
        try:
            rows = await connection.fetch("SELECT id, name FROM amenities ORDER BY name")
            return [Amenity(id=row["id"], name=row["name"]) for row in rows]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/building-types", response_model=List[BuildingType])
async def get_building_types():
    """
    Get all available building types
    """
    pool = await get_pool()
    async with pool.acquire() as connection:
        try:
            rows = await connection.fetch("SELECT id, type FROM building_types ORDER BY type")
            return [BuildingType(id=row["id"], type=row["type"]) for row in rows]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/genders", response_model=List[Gender])
async def get_genders():
    """
    Get all available genders from gender_enum
    """
    pool = await get_pool()
    async with pool.acquire() as connection:
        try:
            # Query PostgreSQL enum values
            rows = await connection.fetch("""
                SELECT unnest(enum_range(NULL::gender_enum)) as gender
            """)
            # Create Gender objects with index as id
            return [Gender(id=i+1, gender=row["gender"]) for i, row in enumerate(rows)]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")