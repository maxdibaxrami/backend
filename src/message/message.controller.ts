import { Controller, Post, Body, Get, Param, Put, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { processImage, storage } from './upload.config';

export class MessageDto {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: Date;
  mediaUrl?: string; // Optional field
  readAt?: Date;    // Optional field
}

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body('senderId') senderId: string, 
    @Body('recipientId') recipientId: string, 
    @Body('content') content: string,
    @Body('mediaUrl') mediaUrl?: string,  // Optional media URL parameter for images
  ): Promise<Message> {
    return await this.messageService.createMessage(
      +senderId, // Convert to number
      +recipientId, // Convert to number
      content,
      mediaUrl,  // Pass mediaUrl for image
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
    }),
  )
  async uploadFile(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    
    const filePath = file.path;
    if (!filePath) {
      throw new Error('File upload failed, no file path');
    }

    const convertedFilePath = await processImage(filePath);

    // Assuming you have logic for saving this to the database or returning the URL
    return {
      message: 'File uploaded successfully',
      mediaUrl: convertedFilePath,
    };
  }
  
  @Get('user/:userId1/:userId2')
  async getMessages(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ): Promise<MessageDto[]> {
    const parsedUserId1 = parseInt(userId1);
    const parsedUserId2 = parseInt(userId2);
  
    if (isNaN(parsedUserId1) || isNaN(parsedUserId2)) {
      throw new Error('Invalid userId(s), must be valid numbers');
    }
  
    return await this.messageService.getMessagesBetweenUsers(parsedUserId1, parsedUserId2);
  }

  @Get('chat-list/:userId')
  async getChatList(
    @Param('userId') userId: string
  ): Promise<{ 
    userId: number; 
    lastMessage: string; 
    firstName: string; 
    photoUrl: string; 
  }[]> {
    const parsedUserId = parseInt(userId, 10);
    
    // Check for NaN (invalid input)
    if (isNaN(parsedUserId)) {
      throw new Error('Invalid userId, must be a number');
    }

    try {
      // Get the chat list from the service
      return await this.messageService.getChatList(parsedUserId);
    } catch (error) {
      // Handle any potential errors from the service method
      throw new Error(`Failed to retrieve chat list: ${error.message}`);
    }
  }

  @Post(':messageId/read')
  async markAsRead(
    @Param('messageId') messageId: number,
    @Body('userId') userId: number,
  ): Promise<Message> {
    console.log(`Received request to mark message ${messageId} as read by user ${userId}`);
    return await this.messageService.markAsRead(messageId, userId);
  }


  @Delete('conversation/:userId1/:userId2')
  async deleteConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ): Promise<{ message: string }> {
    const parsedUserId1 = parseInt(userId1);
    const parsedUserId2 = parseInt(userId2);

    if (isNaN(parsedUserId1) || isNaN(parsedUserId2)) {
      throw new Error('Invalid userId, must be a number');
    }

    try {
      // Call service method to delete conversation
      await this.messageService.deleteConversationBetweenUsers(parsedUserId1, parsedUserId2);
      return { message: 'Conversation deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  @Post('read-conversation')
  async markAllAsReadBetweenUsers(
    @Body('userId') userId: number,
    @Body('otherUserId') otherUserId: number,
  ): Promise<Message[]> {
    console.log(`Received request to mark all messages between user ${userId} and user ${otherUserId} as read`);
    return await this.messageService.markAllAsReadBetweenUsers(userId, otherUserId);
  }

  
}
