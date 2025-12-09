import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optimized image upload function
export async function uploadToCloudinary(file, folder = null) {
  const defaultFolder = process.env.CLOUDINARY_FOLDER || 'tos-products';
  const uploadFolder = folder || defaultFolder;
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: uploadFolder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { 
            width: parseInt(process.env.CLOUDINARY_MAX_WIDTH) || 800, 
            height: parseInt(process.env.CLOUDINARY_MAX_HEIGHT) || 800, 
            crop: 'limit', 
            quality: process.env.CLOUDINARY_QUALITY || 'auto', 
            fetch_format: 'auto' 
          }
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    if (file instanceof Buffer) {
      const stream = Readable.from(file);
      stream.pipe(uploadStream);
    } else {
      file.pipe(uploadStream);
    }
  });
}

// Upload multiple images
export async function uploadMultipleImages(files, folder = null) {
  const defaultFolder = process.env.CLOUDINARY_FOLDER || 'tos-products';
  const uploadFolder = folder || defaultFolder;
  const uploadPromises = files.map((file) => uploadToCloudinary(file, uploadFolder));
  return Promise.all(uploadPromises);
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
}

export { cloudinary };

