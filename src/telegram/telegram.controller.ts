import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../user/user.service';
import axios from 'axios';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly userService: UserService) {}

  @Post('webhook')
  async handleTelegramUpdate(@Body() update: any) {
    const message = update.message;
    const yourBotUsername = 'moll_moll_bot'; // Your bot username

    if (message && message.text && message.text.startsWith('/start')) {
      const referralCode = this.extractReferralCode(message.text);
      console.log('Extracted referral code:', referralCode); // Log the referral code for debugging
      console.log(`https://t.me/${yourBotUsername}?startapp=${referralCode}`);

      // Send the welcome message with image, caption, and buttons
      await this.sendMessage(
        message.chat.id,
        'Welcome to Mull Mull! \nDiscover new connections, chat, and find matches that fit your vibe!',
        `https://t.me/${yourBotUsername}?startapp=${referralCode}`,
        'https://t.me/mollmoll_chat'
      );
    }
  }

  private extractReferralCode(text: string): string {
    console.log('Incoming text:', text); // Log the full message text for debugging

    // Adjusted regex to handle different cases
    const match = text.match(/\/start\s*=?([a-zA-Z0-9\-]*)/);
    return match && match[1] ? match[1] : null;
  }

  private async sendMessage(chatId: string, text: string, miniAppUrl: string, channelUrl: string) {
    const token = '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko'; // Replace with your bot's token
    const url = `https://api.telegram.org/bot${token}/sendPhoto`;

    const photoUrl = 'https://copychic.online/uploads/profile-pictures/1736710779472-c0754815.webp'; // Example file_id

    const result = await axios.post(
      url,
      {
        chat_id: chatId,
        photo: photoUrl, 
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
