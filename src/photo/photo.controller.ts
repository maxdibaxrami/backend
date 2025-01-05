import { Controller, Post, UploadedFile, UseInterceptors, Body, Patch, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { UserService } from 'src/user/user.service';
import { processImage } from '../upload.config';  // Import the image processing function
import {storage} from '../upload.config'

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

    // Convert the image to webp format
    const convertedFilePath = await processImage(filePath);

    // Pass the converted file path to the service
    return this.photoService.addPhoto(user, convertedFilePath, order);
  }

  @Patch('update-file/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,  // Use custom storage configuration for handling file upload
    }),
  )
  async updatePhotoFile(
    @Param('id') photoId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('No file uploaded.');
    }

    const filePath = file.path;
    if (!filePath) {
      throw new Error('File upload failed, no file path');
    }

    // Convert the image to webp format
    const convertedFilePath = await processImage(filePath);

    // Call the service to update the photo's URL with the new file path
    return this.photoService.updatePhotoFile(photoId, convertedFilePath);
  }
}
