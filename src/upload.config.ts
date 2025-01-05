import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import * as sharp from 'sharp';  // Import sharp for image processing
import { promises as fs } from 'fs';  // Importing fs.promises for file operations
import * as heicConvert from 'heic-convert';  // Import heic-convert

export const storage = diskStorage({
  destination: './uploads/profile-pictures', // Modify destination if needed
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`; 
    const fileExtension = '.webp';  // Force webp format
    callback(null, `${uniqueSuffix}${fileExtension}`);
  },
});

export async function processImage(inputFilePath: string): Promise<string> {
  // Generate a unique filename for the output image
  const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  const outputFilePath = join('./uploads/profile-pictures', `${uniqueSuffix}.webp`); // Save to webp with a unique name

  try {
    // Check the image format metadata
    const metadata = await sharp(inputFilePath).metadata();
    const format = metadata.format as string; // Assert format to string to allow flexible comparisons

    // Handle HEIF/HEIC separately using heic-convert
    if (format === 'heif' || format === 'heic') {
      // Convert HEIF/HEIC to JPEG first using heic-convert
      const inputBuffer = await fs.readFile(inputFilePath);
      
      // Convert HEIC/HEIF to JPEG
      const outputBuffer = await heicConvert({
        buffer: inputBuffer, // Input as buffer
        format: 'JPEG',       // Convert to JPEG first
        quality: 1            // You can adjust the quality if needed
      });

      // Save the JPEG file
      const tempJpegPath = join('./uploads/profile-pictures', `${uniqueSuffix}.jpg`);
      await fs.writeFile(tempJpegPath, outputBuffer);

      // Now convert the JPEG to WebP using sharp
      await sharp(tempJpegPath)
        .webp()  // Convert to WebP format
        .toFile(outputFilePath);

      // Optionally delete the temporary JPEG file
      await fs.unlink(tempJpegPath);

      // Optionally delete the original HEIC file
      await fs.unlink(inputFilePath);

    } else {
      // If the image isn't HEIF/HEIC, directly convert to WebP using sharp
      await sharp(inputFilePath)
        .webp()  // Convert to WebP format
        .toFile(outputFilePath);

      // Optionally delete the original file
      await fs.unlink(inputFilePath);
    }

    return outputFilePath;  // Return the new file path with .webp extension
  } catch (error) {
    throw new Error(`Error processing image: ${error.message}`);
  }
}
