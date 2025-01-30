import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { User } from 'src/user/user.entity';
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import { loadImage } from 'canvas';
import * as path from 'path';  // Ensure this import is at the top of your file
import * as sharp from 'sharp';

// Initialize canvas for face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as unknown as typeof HTMLCanvasElement,
  Image: canvas.Image as unknown as typeof HTMLImageElement,
  ImageData: canvas.ImageData as any
});

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async getPhotosByUser(userId: number): Promise<Photo[]> {
    return this.photoRepository.find({
      where: { user: { id: userId } },
      order: { order: 'ASC' },
    });
  }

  async deletePhoto(photoId: number): Promise<void> {
    await this.photoRepository.delete(photoId);
  }

  async addPhoto(user: User, largePhotoPath: string, smallPhotoPath: string, order: number): Promise<Photo> {
    const newPhoto = this.photoRepository.create({
      largeUrl: largePhotoPath,
      smallUrl: smallPhotoPath,
      order,
      user,
    });

    return this.photoRepository.save(newPhoto);
  }

  async updatePhotoFile(photoId: number, newLargePhotoPath: string, newSmallPhotoPath: string): Promise<Photo> {
    const photo = await this.photoRepository.findOne({ where: { id: photoId } });
  
    if (!photo) {
      throw new Error('Photo not found');
    }
  
    photo.largeUrl = newLargePhotoPath;
    photo.smallUrl = newSmallPhotoPath;
  
    return this.photoRepository.save(photo);
  }

  // New method for face verification

  async verifyFaceWithBuffer(userId: number, uploadedPhotoBuffer: Buffer): Promise<{ verified: boolean, similarity: number }> {
    // Load user's profile photo (large image)
    const userPhotos = await this.getPhotosByUser(userId);
    if (userPhotos.length === 0) {
      throw new Error('User has no profile photos');
    }
  
    const profilePhotoPath = userPhotos[0].largeUrl;  // Assuming the first photo is the profile image
    const profilePhotoFullPath = path.join(__dirname, '..', '..', profilePhotoPath);
  
    console.log('Profile Photo Full Path:', profilePhotoFullPath);
  
    // Convert WebP to PNG using sharp
    const profileImageBuffer = await sharp(profilePhotoFullPath).jpeg().toBuffer();
    const uploadedImageBuffer = await sharp(uploadedPhotoBuffer).jpeg().toBuffer();
  
    // Load the images from buffers
    const profileImage = await loadImage(profileImageBuffer);
    const uploadedImage = await loadImage(uploadedImageBuffer);
  
    // Load face-api models
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
  
    // Detect faces and compute face descriptors
    const profileDetection = await faceapi.detectSingleFace(profileImage as unknown as faceapi.TNetInput)
      .withFaceLandmarks()
      .withFaceDescriptor();
  
    const uploadedDetection = await faceapi.detectSingleFace(uploadedImage as unknown as faceapi.TNetInput)
      .withFaceLandmarks()
      .withFaceDescriptor();
  
    if (!profileDetection) {
      throw new Error('Face not detected in first image of profile');
    }

    if (!uploadedDetection) {
      throw new Error('Face not detected in verify photo');
    }
  
    // Calculate the Euclidean distance between the two face descriptors
    const distance = faceapi.euclideanDistance(profileDetection.descriptor, uploadedDetection.descriptor);
  
    // Threshold for face similarity (you can tweak this)
    const isMatch = distance < 0.6;
  
    return {
      verified: isMatch,
      similarity: 1 - distance,  // Convert distance to similarity score (1 - distance)
    };
  }
}