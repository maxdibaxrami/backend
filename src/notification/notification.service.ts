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
    const token = '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko';
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
    try {
      await axios.post(url, {
        chat_id: telegramId,
        text: text,
      });
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Rate limit exceeded, log and handle retry
        console.error('Rate limit exceeded, retrying...');
        await this.retryTelegramMessage(telegramId, text);
      } else {
        // Handle other errors
        console.error('Telegram API error:', error);
      }
    }
  }
  

  private async retryTelegramMessage(telegramId: string, text: string) {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  
    let retryCount = 0;
    const maxRetries = 5;
  
    while (retryCount < maxRetries) {
      try {
        await delay(1000 * Math.pow(2, retryCount)); // Exponential backoff
        await this.sendTelegramMessage(telegramId, text);
        break;
      } catch (error) {
        retryCount++;
        console.error(`Retry ${retryCount} failed`);
        if (retryCount >= maxRetries) {
          console.error('Max retries reached, aborting');
        }
      }
    }
  }

}
