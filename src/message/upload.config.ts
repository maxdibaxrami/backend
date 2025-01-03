import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';

// Storage configuration with unique filenames for images
export const storage = diskStorage({
  destination: './uploads/messages', // Save images in the 'messages' folder
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`); // Keep original file extension
  },
});
