import { CLOUDINARY_CONFIG, IMAGE_UPLOAD_CONFIG } from './config';
import { apiPost } from './api';

export interface PhotoData {
  uri: string;
  label: string;
  base64: string;
}

export interface UploadedPhoto {
  url: string;
  label: string;
}

/**
 * Get MIME type from file extension
 */
export const getMimeType = (uri: string): string => {
  const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  return IMAGE_UPLOAD_CONFIG.MIME_TYPES[fileExt as keyof typeof IMAGE_UPLOAD_CONFIG.MIME_TYPES] ?? "image/jpeg";
};

/**
 * Upload a single photo to Cloudinary
 */
export const uploadPhotoToCloudinary = async (photo: PhotoData): Promise<UploadedPhoto> => {
  const mimeType = getMimeType(photo.uri);
  
  const formData = new FormData();
  formData.append("file", `data:${mimeType};base64,${photo.base64}`);
  formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_CONFIG.FOLDER);

  const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error("Upload failed: No URL returned");
  }

  return {
    url: data.secure_url,
    label: photo.label
  };
};

/**
 * Upload multiple photos to Cloudinary
 */
export const uploadPhotosToCloudinary = async (photos: PhotoData[]): Promise<UploadedPhoto[]> => {
  const uploadedPhotos: UploadedPhoto[] = [];
  
  for (const photo of photos) {
    try {
      const uploadedPhoto = await uploadPhotoToCloudinary(photo);
      uploadedPhotos.push(uploadedPhoto);
    } catch (error) {
      console.error(`Failed to upload photo: ${error}`);
      throw new Error(`Failed to upload photo: ${error}`);
    }
  }
  
  return uploadedPhotos;
};

/**
 * Extract Cloudinary public ID from URL (for future deletion if needed)
 */
export const extractCloudinaryPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)\./);
  return match ? match[1] : null;
}; 

export const deletePhotosFromCloudinary = async (photos: UploadedPhoto[]) => {
  const publicIds = photos
    .map((photo) => extractCloudinaryPublicId(photo.url))
    .filter(Boolean);

  console.log("Attempting to delete these public IDs:", publicIds);
  
  if (publicIds.length === 0) return;

  try {
    const data = await apiPost('/photos/delete', { public_ids: publicIds });
    console.log("Deletion response:", data);
  } catch (err) {
    console.warn("Failed to delete photos from Cloudinary:", err);
  }
};
