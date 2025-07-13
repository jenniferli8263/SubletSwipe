// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  UPLOAD_URL: "https://api.cloudinary.com/v1_1/ddmbdyidp/image/upload",
  UPLOAD_PRESET: "sublettinder_photoupload",
  FOLDER: "sublettinder/listingphotos"
} as const;

// Image upload settings
export const IMAGE_UPLOAD_CONFIG = {
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  QUALITY: 0.8,
  ALLOWED_TYPES: ['jpg', 'jpeg', 'png', 'heic', 'webp'],
  MIME_TYPES: {
    jpg: "image/jpeg",
    jpeg: "image/jpeg", 
    png: "image/png",
    heic: "image/heic",
    webp: "image/webp"
  } as const
} as const; 