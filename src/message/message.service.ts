import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from 'src/user/user.entity';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>, // Inject MessageRepository
    @InjectRepository(User) private userRepository: Repository<User>, // Inject UserRepository
  ) {}

  async createMessage(senderId: number, recipientId: number, content: string): Promise<Message> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const recipient = await this.userRepository.findOne({ where: { id: recipientId } });
  
    if (!sender || !recipient) {
      throw new Error('Sender or recipient not found');
    }
  
    const message = this.messageRepository.create({ sender, recipient, content });
    return await this.messageRepository.save(message);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: [
        { sender: { id: userId1 }, recipient: { id: userId2 } },
        { sender: { id: userId2 }, recipient: { id: userId1 } },
      ],
      order: { timestamp: 'ASC' },
    });
  }

  async getChatList(userId: string): Promise<{ userId: string; lastMessage: string }[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .select('DISTINCT ON (recipient.id) recipientId', 'userId')
      .addSelect('content', 'lastMessage')
      .where('senderId = :userId OR recipientId = :userId', { userId })
      .orderBy('recipientId, timestamp', 'DESC');
  
    return await query.getRawMany();
  }

  async markAsRead(messageId: number, userId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, recipient: { id: userId } },
    });
  
    if (!message) {
      throw new Error('Message not found or unauthorized');
    }
  
    message.readAt = new Date(); // Mark the message as read
    return this.messageRepository.save(message); // Save the changes
  }
}
