// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Register UserRepository here
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Export UserRepository here
})
export class UserModule {}
