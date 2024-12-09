import { diskStorage } from 'multer';
import { extname } from 'path';

export const fileFilter = (req, file, callback) => {
  const allowedExtensions = /jpeg|jpg|png|gif/;
  const isAllowedExtension = allowedExtensions.test(extname(file.originalname).toLowerCase());
  
  if (isAllowedExtension) {
    callback(null, true);
  } else {
    callback(new Error('Only image files are allowed.'));
  }
};

export const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}${extname(file.originalname)}`);
  },
});
