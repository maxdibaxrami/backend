import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateTelegramData(data: any): boolean {
    const { hash, ...rest } = data;
    const secretKey = crypto
      .createHash('sha256')
      .update('YOUR_TELEGRAM_BOT_TOKEN')
      .digest();

    const dataString = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key]}`)
      .join('\n');

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram data.');
    }

    return true;
  }

  generateJwt(user: any): string {
    const payload = { id: user.id, username: user.username };
    return this.jwtService.sign(payload);
  }
}
