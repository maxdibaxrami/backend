import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { User } from '../user/user.entity';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Method to get all matches
  async getAllMatches(): Promise<Match[]> {
    return await this.matchRepository.find();  // Fetch all matches
  }

  // Method to get matches for a specific user
  async getUserMatches(userId: number): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [
        { user: { id: userId } },      // Matches where the user is the first user
        { likedUser: { id: userId } }, // Matches where the user is the second user
      ],
      relations: ['user', 'likedUser'], // Ensure relationships are loaded
    });
  }

}
