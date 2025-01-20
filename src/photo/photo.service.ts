import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { User } from 'src/user/user.entity';

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
      largeUrl: largePhotoPath,  // Save the large photo path
      smallUrl: smallPhotoPath,  // Save the small photo path
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
  
    // Update the URLs with the new file paths
    photo.largeUrl = newLargePhotoPath;
    photo.smallUrl = newSmallPhotoPath;
  
    return this.photoRepository.save(photo);
  }

  async updatePhoto(photoId: number, newPhotoPath: string, order?: number): Promise<Photo> {
    const photo = await this.photoRepository.findOne({ where: { id: photoId } });

    if (!photo) {
      throw new Error('Photo not found');
    }

    // Update the photo fields
    photo.largeUrl = newPhotoPath;  // Update the large image URL
    if (order !== undefined) {
      photo.order = order;
    }

    return this.photoRepository.save(photo);
  }

}

