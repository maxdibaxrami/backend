import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import * as sharp from 'sharp';  // Import sharp for image processing
import { promises as fs } from 'fs';  // Importing fs.promises for file operations
import * as heicConvert from 'heic-convert';  // Import heic-convert for HEIF/HEIC image conversion
import { join } from 'path';

// Storage configuration for file uploads
export const storage = diskStorage({
  destination: './uploads/messages', // Define the destination folder
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`; 
    const fileExtension = '.webp';  // Force file conversion to WebP format
    callback(null, `${uniqueSuffix}${fileExtension}`);
  },
});

// Image processing function to handle different image formats
export async function processImage(inputFilePath: string): Promise<string> {
  const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  const outputFilePath = join('./uploads/messages', `${uniqueSuffix}.webp`); // Save the image as WebP with a unique name

  try {
    // Get metadata of the input image (format, size, etc.)
    const metadata = await sharp(inputFilePath).metadata();
    const format = metadata.format as string; // Assert format as string to allow flexible comparisons

    // Handle HEIF/HEIC images separately, using 'heic-convert' to convert them
    if (format === 'heif' || format === 'heic') {
      const inputBuffer = await fs.readFile(inputFilePath);

      // Convert HEIF/HEIC to JPEG first using heic-convert
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,  // Convert the input buffer
        format: 'JPEG',       // Convert to JPEG first
        quality: 1            // Quality can be adjusted (1 is highest quality)
      });

      // Save the temporary JPEG file
      const tempJpegPath = join('./uploads/messages', `${uniqueSuffix}.jpg`);
      await fs.writeFile(tempJpegPath, outputBuffer);

      // Now convert the JPEG image to WebP using sharp
      await sharp(tempJpegPath)
        .webp()  // Convert to WebP format
        .toFile(outputFilePath);

      // Optionally delete the temporary JPEG image
      await fs.unlink(tempJpegPath);

      // Optionally delete the original HEIC file
      await fs.unlink(inputFilePath);
    } else {
      // If the image isn't HEIF/HEIC, directly convert it to WebP using sharp
      await sharp(inputFilePath)
        .webp()  // Convert to WebP format
        .toFile(outputFilePath);

      // Optionally delete the original file after conversion
      await fs.unlink(inputFilePath);
    }

    return outputFilePath; // Return the final output file path
  } catch (error) {
    // Handle errors and throw a descriptive message
    throw new Error(`Error processing image: ${error.message}`);
  }
}
