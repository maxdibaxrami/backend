import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { PhotoModule } from '../photo/photo.module';  // Ensure correct import of PhotoModule
import { Like } from 'src/like/like.entity';
import { Match } from 'src/match/match.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([User,Like,Match]),  // Register User entity for TypeORM
    forwardRef(() => PhotoModule),  // Use forwardRef to avoid circular dependency
  ],
  providers: [UserService],  // UserService depends on UserRepository and PhotoService
  controllers: [UserController],
  exports: [UserService],  // Export UserService if needed by other modules
})
export class UserModule {}
