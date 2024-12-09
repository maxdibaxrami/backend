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

  // Like functionality
  async likeUser(userId: number, likedUserId: number): Promise<string> {
    if (userId === likedUserId) {
      throw new Error('User cannot like themselves.');
    }

    // Check if there's already a reciprocal like from liked user
    const reciprocalLike = await this.likeRepository.findOne({
      where: { user: { id: likedUserId }, likedUser: { id: userId } },
    });

    if (reciprocalLike) {
      // Update reciprocal like and create a match
      reciprocalLike.isLiked = true;
      await this.likeRepository.save(reciprocalLike);

      // Create a match
      const match = this.matchRepository.create({
        user: { id: userId } as User,      // Corrected reference to 'user'
        likedUser: { id: likedUserId } as User, // Corrected reference to 'likedUser'
        matchedAt: new Date(),
      });
      await this.matchRepository.save(match);

      return 'Match created!';
    } else {
      // Create a like if no reciprocal like exists
      const like = this.likeRepository.create({
        user: { id: userId } as User,
        likedUser: { id: likedUserId } as User,
        isLiked: false,
      });
      await this.likeRepository.save(like);

      return 'Like recorded.';
    }
  }
}
