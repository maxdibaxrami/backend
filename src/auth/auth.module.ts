import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module'; // Assuming user module is already created

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko', // Change this to a secure key
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
