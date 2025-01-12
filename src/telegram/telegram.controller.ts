import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../user/user.service';
import axios from 'axios';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly userService: UserService) {}

  @Post('webhook')
  async handleTelegramUpdate(@Body() update: any) {
    const message = update.message;

      let welcomeMessage = `Welcome, ! You have been successfully registered.`;

      // Send the message to the user
      await this.sendMessage(message.chat.id, welcomeMessage);
    
  }

  private extractReferralCode(text: string): string | null {
    const urlParams = new URLSearchParams(text.split(' ')[1]?.replace('/start?', '') || '');
    return urlParams.get('start');
  }

  private async sendMessage(chatId: string, text: string) {
    const token = 'YOUR_BOT_TOKEN_HERE'; // Use your bot's token
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    await axios.post(url, {
      chat_id: chatId,
      text: text,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
