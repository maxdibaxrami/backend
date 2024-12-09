import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { User } from '../user/user.entity';

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


  async findMatches(
    userId: number,
    filters: {
      ageRange?: [number, number]; // [minAge, maxAge]
      city?: string;
      country?: string;
      languages?: string[];
    },
  ): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    // Exclude the requesting user
    query.where('user.id != :userId', { userId });

    // Apply age range filter
    if (filters.ageRange) {
      query.andWhere('user.age BETWEEN :minAge AND :maxAge', {
        minAge: filters.ageRange[0],
        maxAge: filters.ageRange[1],
      });
    }

    // Apply city filter
    if (filters.city) {
      query.andWhere('user.city = :city', { city: filters.city });
    }

    // Apply country filter
    if (filters.country) {
      query.andWhere('user.country = :country', { country: filters.country });
    }

    // Apply languages filter
    if (filters.languages) {
      query.andWhere('user.languages @> ARRAY[:...languages]::text[]', {
        languages: filters.languages,
      });
    }

    // Execute query and return matches
    return await query.getMany();
  }
}
