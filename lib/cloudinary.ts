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
  // Ensure the temp directory exists
  const tempDir = path.join(process.cwd(), 'tmp');
  await fs.mkdir(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
  await fs.writeFile(tempFilePath, buffer);

  const result = await cloudinary.uploader.upload(tempFilePath, {
    folder: 'cybersecurity-modules',
  });
  await fs.unlink(tempFilePath); // Clean up temp file

  return result.secure_url;
};

export const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};