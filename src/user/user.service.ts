import { Injectable, NotFoundException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Photo } from '../photo/photo.entity';
import { Like } from 'src/like/like.entity';
import { Match } from 'src/match/match.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like) // If you're using Like repository
    private likeRepository: Repository<Like>,
    @InjectRepository(Like) // If you're using Like repository
    private matchRepository: Repository<Match>,
  ) {}


  async updateUserPhotos(user: User): Promise<User> {
    return await this.userRepository.save(user); // Save the updated user entity with new photos
  }

  async softDeleteUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.isDeleted = true;
    return this.userRepository.save(user);
  }

  async setPremiumStatus(id: number, isPremium: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.premium = isPremium;
    return this.userRepository.save(user);
  }

  async blockUser(userId: number, blockedUserId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    // Ensure blockedUsers is initialized as an empty array if it's null
    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }
  
    // Add blocked user to the blockedUsers list
    user.blockedUsers.push(blockedUserId);
  
    // Save the updated user
    await this.userRepository.save(user);
    
    return { message: 'User blocked successfully' };
  }

  async reportUser(id: number, reportedUserId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.reportedUsers.push(reportedUserId);
    return this.userRepository.save(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Ensure CreateUserDto matches User entity types
      const newUser = this.userRepository.create(createUserDto); // Use create for mapping
      return await this.userRepository.save(newUser); // Save the entity to the database
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user', error.message);
    }
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users', error.message);
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    try {
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user', error.message);
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.getUserById(id);
    try {
      const result = await this.userRepository.delete(user.id);
      return result.affected > 0;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user', error.message);
    }
  }

  async patchUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    try {
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to patch user', error.message);
    }
  }

  async setUserLanguage(id: number, language: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.language = language;
    return this.userRepository.save(user);
  }

  async findByTelegramId(telegramId: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { telegramId } });
  }
  
   // Fetch user by ID
   async getUserByIdPhoto(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['photos'], // Make sure this includes the relation to photos if needed
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  // If you handle updating user with photo details here
  async addPhotoToUser(user: User, photo: Photo) {
    if (!user.photos) {
      user.photos = [];
    }

    user.photos.push(photo);
    await this.userRepository.save(user);
  }

  async getAvailableUsersForLike(
    userId: number,
    filters: {
      ageRange?: [number, number]; // [minAge, maxAge]
      city?: string;
      country?: string;
      languages?: string[];
    },
    pagination: {
      page: number; // Page number
      limit: number; // Number of items per page
    },
  ): Promise<{ users: User[], total: number }> {
    const query = this.userRepository.createQueryBuilder('user');
  
    // Exclude the current user
    query.where('user.id != :userId', { userId });
  
    // Exclude users who have been liked or have matched
    const likedUsersSubquery = this.likeRepository
      .createQueryBuilder('like')
      .select('like.likedUserId')
      .where('like.userId = :userId', { userId })
      .andWhere('like.isLiked = true');
  
    query.andWhere(`user.id NOT IN (${likedUsersSubquery.getQuery()})`);
  
    const likedByUsersSubquery = this.likeRepository
      .createQueryBuilder('like')
      .select('like.userId')
      .where('like.likedUserId = :userId', { userId })
      .andWhere('like.isLiked = true');
  
    query.andWhere(`user.id NOT IN (${likedByUsersSubquery.getQuery()})`);
  
    const matchedUsersSubquery = this.matchRepository
      .createQueryBuilder('match')
      .select('match.likedUserId')
      .where('match.userId = :userId', { userId });
  
    query.andWhere(`user.id NOT IN (${matchedUsersSubquery.getQuery()})`);
  
    // Apply filters
    if (filters.ageRange) {
      query.andWhere('user.age BETWEEN :minAge AND :maxAge', {
        minAge: filters.ageRange[0],
        maxAge: filters.ageRange[1],
      });
    }
  
    if (filters.city) {
      query.andWhere('user.city = :city', { city: filters.city });
    }
  
    if (filters.country) {
      query.andWhere('user.country = :country', { country: filters.country });
    }
  
    if (filters.languages) {
      query.andWhere('user.languages @> ARRAY[:...languages]::text[]', {
        languages: filters.languages,
      });
    }
  
    // Include photos
    query.leftJoinAndSelect('user.photos', 'photos');
  
    // Pagination: Apply skip and take based on page and limit
    const skip = (pagination.page - 1) * pagination.limit;
    query.skip(skip).take(pagination.limit);
  
    // Fetch total count of users before applying pagination
    const total = await query.getCount();
  
    // Fetch available users with pagination
    const users = await query.getMany();
  
    return { users, total };
  }
  
  async getExploreUsersBasic(
    userId: number,
    filters: {
      ageRange?: [number, number]; // [minAge, maxAge]
      city?: string;
      country?: string;
      languages?: string[];
    },
    pagination: {
      page: number; // Page number
      limit: number; // Number of items per page
    },
  ): Promise<{ users: User[], total: number }> {
    const query = this.userRepository.createQueryBuilder('user');
  
    // Exclude the current user
    query.where('user.id != :userId', { userId });
  
    // Exclude users who have already been liked or matched
    const likedUsersSubquery = this.likeRepository
      .createQueryBuilder('like')
      .select('like.likedUserId')
      .where('like.userId = :userId', { userId })
      .andWhere('like.isLiked = true');
  
    query.andWhere(`user.id NOT IN (${likedUsersSubquery.getQuery()})`);
  
    const likedByUsersSubquery = this.likeRepository
      .createQueryBuilder('like')
      .select('like.userId')
      .where('like.likedUserId = :userId', { userId })
      .andWhere('like.isLiked = true');
  
    query.andWhere(`user.id NOT IN (${likedByUsersSubquery.getQuery()})`);
  
    const matchedUsersSubquery = this.matchRepository
      .createQueryBuilder('match')
      .select('match.likedUserId')
      .where('match.userId = :userId', { userId });
  
    query.andWhere(`user.id NOT IN (${matchedUsersSubquery.getQuery()})`);
  
    // Apply filters
    if (filters.ageRange) {
      query.andWhere('user.age BETWEEN :minAge AND :maxAge', {
        minAge: filters.ageRange[0],
        maxAge: filters.ageRange[1],
      });
    }
  
    if (filters.city) {
      query.andWhere('user.city = :city', { city: filters.city });
    }
  
    if (filters.country) {
      query.andWhere('user.country = :country', { country: filters.country });
    }
  
    if (filters.languages) {
      query.andWhere('user.languages @> ARRAY[:...languages]::text[]', {
        languages: filters.languages,
      });
    }
  
    // Include photos
    query.leftJoinAndSelect('user.photos', 'photos');
  
    // Pagination: Apply skip and take based on page and limit
    const skip = (pagination.page - 1) * pagination.limit;
    query.skip(skip).take(pagination.limit);
  
    // Fetch total count of users before applying pagination
    const total = await query.getCount();
  
    // Fetch available users with pagination
    const users = await query.getMany();
  
    return { users, total };
  }
  
  
  
}


