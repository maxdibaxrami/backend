import { Controller, Get, Param, Query } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from './match.entity';
import { User } from '../user/user.entity';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // Route to get all matches
  @Get()
  async getAllMatches(): Promise<Match[]> {
    return await this.matchService.getAllMatches();
  }

  // Route to get matches for a specific user
  @Get('user/:userId')
  async getUserMatches(@Param('userId') userId: number): Promise<Match[]> {
    return await this.matchService.getUserMatches(userId);
  }

  @Get('filter/:userId')
  async getFilteredMatches(
    @Param('userId') userId: number,
    @Query('ageRange') ageRange: string, // Example: "18,25"
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('languages') languages?: string, // Example: "English,Spanish"
  ): Promise<User[]> {
    // Parse query parameters
    const ageRangeParsed = ageRange?.split(',').map(Number) as [number, number];
    const languagesParsed = languages?.split(',');

    return await this.matchService.findMatches(userId, {
      ageRange: ageRangeParsed,
      city,
      country,
      languages: languagesParsed,
    });
  }
}
