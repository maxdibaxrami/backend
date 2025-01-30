// src/message/message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities/message.entity';
import { UserModule } from '../user/user.module'; // Import UserModule
import { User } from '../user/user.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]), // Register Message and User repositories
    UserModule, // Import UserModule to get access to UserRepository
    NotificationModule,
  ],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService], // Export for use in other modules (e.g., ChatGateway)
})
export class MessageModule {}
