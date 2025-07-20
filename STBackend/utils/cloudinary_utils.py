import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv() 

# Optional: configure Cloudinary only once
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

def delete_photo(public_id: str):
    result = cloudinary.uploader.destroy(public_id)
    return result
