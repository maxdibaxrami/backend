import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { Match } from '../match/match.entity';
import { User } from '../user/user.entity';
import { UserResponseDto } from 'src/user/dto/user-response.dto'
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private notificationService: NotificationService, // Inject NotificationService

  ) {}

  async likeUser(userId: number, likedUserId: number): Promise<{ message: string; matchCreated: boolean }> {
    if (userId === likedUserId) {
      throw new Error('User cannot like themselves.');
    }
  
    // Check if the user has already liked the likedUserId before
    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, likedUser: { id: likedUserId } },
    });
  
    if (existingLike) {
      // If like exists, we raise an error (like can only be done once)
      throw new Error('You have already liked this user.');
    }
  
    // Check if a match already exists between the users
    const existingMatch = await this.matchRepository.findOne({
      where: [
        { user: { id: userId }, likedUser: { id: likedUserId } },
        { user: { id: likedUserId }, likedUser: { id: userId } },
      ],
    });
  
    if (existingMatch) {
      // If a match already exists, raise an error
      throw new Error('A match already exists between these users.');
    }
  
    // Check if there's already a reciprocal like from liked user
    const reciprocalLike = await this.likeRepository.findOne({
      where: { user: { id: likedUserId }, likedUser: { id: userId } },
    });
  
    if (reciprocalLike) {
      // If reciprocal like exists, create a match
      reciprocalLike.isLiked = true;
      await this.likeRepository.save(reciprocalLike);
  
      // Create a match
      const match = this.matchRepository.create({
        user: { id: userId } as User,
        likedUser: { id: likedUserId } as User,
        matchedAt: new Date(),
      });
      await this.matchRepository.save(match);

      this.notificationService.createNotification("Match created! 🎈", likedUserId)
      this.notificationService.createNotification("Match created! 🎈", userId)

      return {
        message: 'Match created!',
        matchCreated: true,
      };
    } else {
      // If no reciprocal like exists, create a like from the user
      const like = this.likeRepository.create({
        user: { id: userId } as User,
        likedUser: { id: likedUserId } as User,
        isLiked: false,
      });
      await this.likeRepository.save(like);

      this.notificationService.createNotification("Someone like you! ❤️", likedUserId)
      
      return {
        message: 'Like recorded.',
        matchCreated: false,
      };
    }
  }
  

  async getLikesByUser(userId: number): Promise<UserResponseDto[]> {
    const likes = await this.likeRepository.find({
      where: { likedUser: { id: userId }, isLiked: false },
      relations: ['user', 'user.photos'],  // Include the user who liked and their photos
    });
  
    // Map over the 'likes' to extract the users and transform them to the desired format
    return likes.map(like => this.transformToUserResponseDto(like.user));
  }
  
  // Helper function to transform User entity to UserResponseDto
  private transformToUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      city: user.city,
      profileData: {
        lookingFor: user.lookingFor,
        education: user.education,
        work: user.work,
        bio: user.bio,
      },
      moreAboutMe: {
        languages: user.languages,
        height: user.height,
        relationStatus: user.relationStatus,
        sexuality: user.sexuality,
        kids: user.kids,
        smoking: user.smoking,
        drink: user.drink,
        pets: user.pets
      },
      country: user.country,
      interests: user.interests,
      premium: user.premium,
      activityScore: user.activityScore,
      gender: user.gender,
      lastActive: user.lastActive,
      verifiedAccount: user.verifiedAccount,
      photos: user.photos ? user.photos.map(photo => ({
        id: photo.id,
        url: photo.smallUrl,
        order: photo.order,
      })) : [],
      age: user.age,
      languagePreferences: user.languagePreferences,
      isDeleted: user.isDeleted,
      language: user.language,
      lat: user.lat,
      lon: user.lon,
    };
  }
  
}


