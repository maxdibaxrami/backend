import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // For existing users
  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // For new users logging in via Telegram
  async telegramLogin(user: any) {
    const existingUser = await this.userService.findByTelegramId(user.telegramId);

    if (!existingUser) {
      // Handle registration logic here
      return { message: 'Please complete registration' };
    } else {
      const payload = { username: existingUser.username, sub: existingUser.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }
}
