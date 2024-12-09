import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() data: any) {
    const isValid = this.authService.validateTelegramData(data);
    if (isValid) {
      return { token: this.authService.generateJwt(data) };
    }
  }
}
