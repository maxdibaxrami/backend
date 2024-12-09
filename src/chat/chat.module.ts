import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message } from '../message/entities/message.entity'; // Import Message entity

@Module({
  imports: [TypeOrmModule.forFeature([Message])], // Register Message entity
  providers: [ChatGateway, ChatService], // Register ChatService and ChatGateway
  exports: [ChatService], // Export ChatService if needed in other modules
})
export class ChatModule {}
