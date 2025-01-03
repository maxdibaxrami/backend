import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  async likeUser(@Body() { userId, likedUserId }: { userId: number; likedUserId: number }) {
    return this.likeService.likeUser(userId, likedUserId);
  }

  @Get(':userId/likes')
  async getLikes(@Param('userId') userId: number) {
    return this.likeService.getLikesByUser(userId);
  }
}
