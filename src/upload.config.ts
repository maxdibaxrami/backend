import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import * as sharp from 'sharp';  // Image processing library
import { promises as fs } from 'fs';  // File system operations
import * as heicConvert from 'heic-convert';  // HEIC to JPEG converter

export const storage = diskStorage({
  destination: './uploads/profile-pictures', // Modify destination if needed
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
    const fileExtension = '.webp';  // Force webp format for all files
    callback(null, `${uniqueSuffix}${fileExtension}`);
  },
});

export async function processImage(inputFilePath: string): Promise<{ largeImagePath: string, smallImagePath: string }> {
  // Generate a unique suffix for the output filenames
  const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  
  // Define output paths for large and small versions of the image in different folders
  const largeImagePath = join('./uploads/profile-pictures/large', `${uniqueSuffix}.webp`); // 1080px version
  const smallImagePath = join('./uploads/profile-pictures/small', `${uniqueSuffix}.webp`);  // 320px version

  try {
    // Check the image format metadata
    const metadata = await sharp(inputFilePath).metadata();
    const format = metadata.format as string; // Assert format to string to allow flexible comparisons

    // Define the sizes for large and small versions
    const largeSize = { width: 1080, height: 1080 };  // Large image: Width 1080px
    const smallSize = { width: 320, height: 320 };   // Small image: Width 320px

    // Handle HEIF/HEIC separately using heic-convert
    if (format === 'heif' || format === 'heic') {
      const inputBuffer = await fs.readFile(inputFilePath);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1
      });

      const tempJpegPath = join('./uploads/profile-pictures', `${uniqueSuffix}.jpg`);
      await fs.writeFile(tempJpegPath, outputBuffer);

      // Save the large and small versions in different folders
      await sharp(tempJpegPath).resize(largeSize).webp().toFile(largeImagePath);
      await sharp(tempJpegPath).resize(smallSize).webp().toFile(smallImagePath);

      // Cleanup temporary file
      await fs.unlink(tempJpegPath);
      await fs.unlink(inputFilePath);  // Remove the original HEIC file

    } else {
      // Directly process non-HEIC images, saving large and small versions in different folders
      await sharp(inputFilePath).resize(largeSize).webp().toFile(largeImagePath);
      await sharp(inputFilePath).resize(smallSize).webp().toFile(smallImagePath);

      // Clean up original image file after processing
      await fs.unlink(inputFilePath);
    }

    // Return the paths to the processed images
    return { largeImagePath, smallImagePath };
  } catch (error) {
    // Throwing an error with a descriptive message if something goes wrong
    throw new Error(`Error processing image: ${error.message}`);
  }
}
