import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateUserProfilePicture(id: number, filename: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.photoUrl = filename;
    return this.userRepository.save(user);
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
  
}
