import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { Match } from './match.entity';
import { User } from '../user/user.entity'; // Import User entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, User]), // Add User to the TypeOrmModule
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
