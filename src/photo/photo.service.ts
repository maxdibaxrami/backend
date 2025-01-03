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

  // Updated addPhoto method - no resizing, just save the original photo path
  async addPhoto(user: User, photoPath: string, order: number): Promise<Photo> {
    const newPhoto = this.photoRepository.create({
      url: photoPath,  // Save the original photo path
      order,
      user,
    });

    return this.photoRepository.save(newPhoto);
  }

  async updatePhoto(photoId: number, newPhotoPath: string, order?: number): Promise<Photo> {
    const photo = await this.photoRepository.findOne({ where: { id: photoId } });

    if (!photo) {
      throw new Error('Photo not found');
    }

    // Update the photo fields
    photo.url = newPhotoPath;
    if (order !== undefined) {
      photo.order = order;
    }

    return this.photoRepository.save(photo);
  }

  async updatePhotoFile(photoId: number, newPhotoPath: string): Promise<Photo> {
    const photo = await this.photoRepository.findOne({ where: { id: photoId } });

    if (!photo) {
      throw new Error('Photo not found');
    }

    // Update the URL with the new photo file path
    photo.url = newPhotoPath;

    return this.photoRepository.save(photo);
  }

}

