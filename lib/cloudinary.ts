import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result: any = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'cybersecurity-modules' },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  return result.secure_url;
};

export const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};

