import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../user/user.service';
import axios from 'axios';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly userService: UserService) {}

  @Post('webhook')
  async handleTelegramUpdate(@Body() update: any) {
    const message = update.message;
    const yourBotUsername = 'moll_moll_bot';

    if (message && message.text && message.text.startsWith('/start')) {
      const referralCode = this.extractReferralCode(message.text);

      // Send the message to the user
      await this.sendMessage(
        message.chat.id,
        'AgACAgQAAxkBAAECdbRng2ht0WiRYZE9iMKIQuEJG8O0_QACyMUxGydWGVCyLHmVUZz5yQEAAwIAA20AAzYE', // Image URL
        'Welcome to Mull Mull \n Discover new connections, chat, and find matches that fit your vibe!',
        `https://t.me/${yourBotUsername}?start=${referralCode}`, // Mini app URL with referral code
        'https://t.me/mollmoll_chat' // Channel URL
      );
      
    }
    
  }

  private extractReferralCode(text: string): string | null {
    const urlParams = new URLSearchParams(text.split(' ')[1]?.replace('/start?', '') || '');
    return urlParams.get('start');
  }

  private async sendMessage(chatId: string, fileId: string, text: string, miniAppUrl: string, channelUrl: string) {
    const token = '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko'; // Use your bot's token
    const url = `https://api.telegram.org/bot${token}/sendPhoto`;
    
    await axios.post(url, {
      chat_id: chatId,
      photo: fileId, // Using the file_id instead of a URL
      caption: text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open Mini App',
              url: miniAppUrl,
            },
            {
              text: 'Open Channel',
              url: channelUrl,
            },
          ],
        ],
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  }
  
}
