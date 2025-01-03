import { Controller, Get, Param, Query } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from './match.entity';
import { User } from '../user/user.entity';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

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

}
