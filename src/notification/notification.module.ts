import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification/notification';
import { User } from '../user/user.entity'; // Import the User entity

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])], // Import both entities
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService], // Export the NotificationService for use in other modules
})
export class NotificationModule {}
