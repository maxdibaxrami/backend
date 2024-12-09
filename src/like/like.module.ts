import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Match } from '../match/match.entity'; // Import Match entity for injection

@Module({
  imports: [TypeOrmModule.forFeature([Like, Match])],  // Register Like and Match repositories
  providers: [LikeService],
  controllers: [LikeController],
})
export class LikeModule {}
