import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification/notification';
import axios from 'axios';
import { User } from 'src/user/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>, // Inject User repository
  
  ) {}

  findAll(): Promise<Notification[]> {
    return this.notificationRepository.find();
  }

  findOne(id: string): Promise<Notification> {
    return this.notificationRepository.findOne({ where: { id } });
  }

  async update(id: string, message: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (notification) {
      notification.message = message;
      return this.notificationRepository.save(notification);
    }
    return null;
  }

  async remove(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async createNotification(message: string, userId: number): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const notification = this.notificationRepository.create({ message, user });
    const savedNotification = await this.notificationRepository.save(notification);

    // Send Telegram message after saving the notification
    this.sendTelegramMessage(user.telegramId, message);

    return savedNotification;
  }

  // Other CRUD methods (findAll, findOne, update, remove) remain the same

  private async sendTelegramMessage(telegramId: string, text: string) {
    
    const token = '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko'; // Replace with your bot's token
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const result = await axios.post(
      url,
      {
        chat_id: telegramId,
        text: text,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(result.data);
  }
}
