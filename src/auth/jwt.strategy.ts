import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // Import your UserService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko', // Use the same key as in auth.module
    });
  }

  async validate(payload: any) {
    // Validate the JWT token and return the user
    return this.userService.findByTelegramId(payload.sub);
  }
}
