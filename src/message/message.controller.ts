import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body('senderId') senderId: string, 
    @Body('recipientId') recipientId: string, 
    @Body('content') content: string,
  ): Promise<Message> {
    // Convert senderId and recipientId to numbers before passing them to the service
    return await this.messageService.createMessage(
      +senderId,  // Convert to number
      +recipientId, // Convert to number
      content,
    );
  }

  @Get(':userId1/:userId2')
  async getMessages(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ): Promise<Message[]> {
    // Convert userId1 and userId2 to numbers before passing to the service
    return await this.messageService.getMessagesBetweenUsers(+userId1, +userId2);
  }

  @Get('chat-list/:userId')
  async getChatList(@Param('userId') userId: string): Promise<{ userId: string; lastMessage: string }[]> {
    // Convert userId to number
    return await this.messageService.getChatList(userId);
  }
}
