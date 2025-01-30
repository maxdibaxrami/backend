import { Injectable, NotFoundException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Photo } from '../photo/photo.entity';
import { Like } from 'src/like/like.entity';
import { Match } from 'src/match/match.entity';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like) // If you're using Like repository
    private likeRepository: Repository<Like>,
    @InjectRepository(Like) // If you're using Like repository
    private matchRepository: Repository<Match>,
    private notificationService: NotificationService, // Inject NotificationService
    
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

  async setVerifiedAccountStatus(id: number, verifiedAccount: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.verifiedAccount = verifiedAccount;
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
      newUser.referralCode = uuidv4(); // Generate unique referral code
      newUser.createdAt = new Date();
      return await this.userRepository.save(newUser); // Save the entity to the database
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user', error.message);
    }
  }

  async findOneByReferralCode(referralCode: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { referralCode },
    });
  }

  async applyReferralReward(newUser: User): Promise<void> {
    if (newUser.referralCode) {
      // Step 1: Check if the newUser has a referralCode
      // If the new user has a referral code, proceed.
  
      // Step 2: Find the referrer (the user who referred the newUser)
      const referrer = await this.userRepository.findOne({
        where: { referralCode: newUser.referralCode },
      });
  
      // Step 3: If a referrer is found, increase their reward points
      if (referrer) {
        referrer.rewardPoints += 50; // Increment reward points (example: 1 point per referral)
        
        // Step 4: Save the updated referrer user data to the database
        await this.userRepository.save(referrer);
  
        // Optionally, Step 5: Send a notification to the referrer
        // sendNotificationToReferrer(referrer); // Not implemented, but you could send a message to notify the referrer
      }
    }
  }

  private async updateReferralReward(referrerId: number, amount: number): Promise<void> {
    // Step 1: Find the referrer by their user ID
    const referrer = await this.userRepository.findOne({
      where: { id: referrerId },
    });
  
    // Step 2: If a referrer is found, update their reward points
    if (referrer) {
      referrer.rewardPoints += amount; // Can be positive (increase) or negative (decrease)
      await this.userRepository.save(referrer);
  
      // Optionally notify the referrer about the update
      // sendNotificationToReferrer(referrer); // Not implemented
      this.notificationService.createNotification(`Referral add Successfull! 🌟 your energy:${referrer.rewardPoints += amount}.`, referrer.id)

    }
  }

  async decreaseReferralReward(user: number, amount: number): Promise<void> {
    await this.updateReferralReward(user, -amount);
  }

  async increaseReferralReward(user: number, amount: number): Promise<void> {
    await this.updateReferralReward(user, amount);
  }
  

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8); // Simple 6-character code
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
  
    // Get the gender of the authenticated user
    const currentUser = await this.userRepository.findOne({ where: { id: userId } });
    if (!currentUser) {
      throw new Error('User not found');
    }
  
    const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';
  
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
  
    // Filter by opposite gender
    query.andWhere('user.gender = :gender', { gender: oppositeGender });
  
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
      genderFilter?: 'female' | 'male' | 'all'; // Add gender filter option
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
  
    // Apply gender filter
    if (filters.genderFilter && filters.genderFilter !== 'all') {
      query.andWhere('user.gender = :genderFilter', { genderFilter: filters.genderFilter.toLowerCase() });
    }
  
    // Apply other filters (ageRange, city, country, languages)
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
  
  async getUserSummary(userId: number): Promise<{ id: number; firstName: string; age?: number; imageUrl?: string ; verifiedAccount?: boolean ; premium?: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['photos'],
    });
  
    if (!user) {
      return null;
    }
  
    return {
      id: user.id,
      firstName: user.firstName,
      age: user.age,
      verifiedAccount : user.verifiedAccount,
      premium: user.premium,
      imageUrl: user.photos.length ? user.photos[0].smallUrl : null, // Return first photo if available
    };
  }
  
  
  
}


