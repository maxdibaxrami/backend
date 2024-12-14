import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Req() req) {
    return this.authService.login(req.user);
  }

  @Get('telegram/callback')
  @UseGuards(AuthGuard('telegram'))
  telegramAuthCallback(@Req() req) {
    return this.authService.telegramLogin(req.user);
  }
}