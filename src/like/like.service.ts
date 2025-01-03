import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { Match } from '../match/match.entity';
import { User } from '../user/user.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
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
  
      return {
        message: 'Like recorded.',
        matchCreated: false,
      };
    }
  }
  

  async getLikesByUser(userId: number): Promise<User[]> {
    const likes = await this.likeRepository.find({
      where: { likedUser: { id: userId }, isLiked: false },
      relations: ['user'],  // Include the user who liked
    });

    // Map over the 'likes' to extract the users who liked the specified user
    return likes.map(like => like.user);
  }
}
