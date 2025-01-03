// upload.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';



// Storage configuration with unique filenames
export const storage = diskStorage({
  destination: './uploads/profile-pictures', // Modify destination if needed
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`; 
    callback(null, `${uniqueSuffix}${extname(file.originalname)}.jpg`);
  },
});
