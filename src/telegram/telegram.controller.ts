import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../user/user.service';
import fetch from 'node-fetch';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly userService: UserService) {}

  @Post('webhook')
  async handleTelegramUpdate(@Body() update: any) {
    const message = update.message;

    if (message && message.text && message.text.startsWith('/start')) {
      const params = message.text.split(' ');
      let referralCode = null;

      if (params.length > 1) {
        referralCode = params[1];
      }

      // Save the user with referral info
      const username = message.from.username;
      const newUser = await this.userService.saveUserWithReferral(username, referralCode);

      // Send a welcome message or referral confirmation
      let welcomeMessage = `Welcome, ${username}! You have been successfully registered.`;
      if (newUser.referrer) {
        welcomeMessage += `\nYou were referred by: ${newUser.referrer.username}`;
      }

      // Send the message to the user
      await this.sendMessage(message.chat.id, welcomeMessage);
    }
  }

  private async sendMessage(chatId: string, text: string) {
    const token = '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko'; // Use your bot's token
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
  }
}
