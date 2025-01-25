import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { UserService } from 'src/user/user.service';
import { processImage, storage } from '../upload.config';
import { memoryStorage } from 'multer';

@Controller('photo')
export class PhotoController {
  constructor(
    private readonly photoService: PhotoService,
    private readonly userService: UserService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,  // Use custom storage configuration
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File, 
    @Body('userId') userId: number, 
    @Body('order') order: number, 
  ) {
    if (!file) {
      throw new Error('No file uploaded.');
    }

    const user = await this.userService.getUserById(userId);
    const filePath = file.path;
    if (!filePath) {
      throw new Error('File upload failed, no file path');
    }

    // Process the image to generate both large and small versions (your existing logic)
    const { largeImagePath, smallImagePath } = await processImage(filePath);

    return this.photoService.addPhoto(user, largeImagePath, smallImagePath, order);
  }

  // New endpoint for face verification
  @Post('verify')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),  // Use memory storage to keep the file in memory
    }),
  )
  async verifyPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    if (!file) {
      throw new Error('No file uploaded.');
    }
  
    // The uploaded image is available in `file.buffer`, no need to save it to disk
    const uploadedPhotoBuffer = file.buffer;
  
    // Call the face verification service and pass the buffer directly
    const result = await this.photoService.verifyFaceWithBuffer(userId, uploadedPhotoBuffer);
  
    return result;
  }
}
