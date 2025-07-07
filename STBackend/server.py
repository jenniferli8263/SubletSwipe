from fastapi import FastAPI
from contextlib import asynccontextmanager
from db import init_db, close_db
from routes import listings, hello, renters, auth, users

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

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:8081"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)