import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../message/entities/message.entity';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async saveMessage(data: { senderId: number; recipientId: number; content?: string; mediaUrl?: string; }): Promise<Message> {
    const message = this.messageRepository.create({
      sender: { id: +data.senderId },  // Convert to number
      recipient: { id: +data.recipientId },  // Convert to number
      content: data.content,
      mediaUrl: data.mediaUrl,
    });
    return this.messageRepository.save(message);  // Fix: No need for `message[0]`, just save the message
}
  async markAsRead(messageId: number, userId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { 
        id: messageId, 
        recipient: { id: Number(userId) }  // Adjusted field to recipient
      },
    });
  
    if (!message) {
      throw new Error('Message not found or unauthorized');
    }
  
    message.readAt = new Date(); // Mark the message as read
    return this.messageRepository.save(message); // Save the changes
  }

  async uploadMedia(file: Express.Multer.File): Promise<string> {
    const uploadPath = join(__dirname, '..', '..', 'uploads', file.originalname);
    const writeStream = createWriteStream(uploadPath);
    writeStream.write(file.buffer);
    writeStream.end();
    return `/uploads/${file.originalname}`; // URL to access the file
  }
}
