import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../user/user.service';
import axios from 'axios';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly userService: UserService) {}

  // Step 2: Webhook handler to receive updates from Telegram
  @Post('webhook')
  async handleTelegramUpdate(@Body() update: any) {
    const message = update.message;
    const yourBotUsername = 'moll_moll_bot'; // Your bot username

    // Handle the /start command
    if (message && message.text && message.text.startsWith('/start')) {
      const referralCode = this.extractReferralCode(message.text);

      // Send the welcome message with image, caption, and buttons
      await this.sendMessage(
        message.chat.id,
        'Welcome to Mull Mull \n Discover new connections, chat, and find matches that fit your vibe!',
        `https://t.me/${yourBotUsername}?start=${referralCode}`, // Mini app URL with referral code
        'https://t.me/mollmoll_chat' // Channel URL
      );
    }
  }
        //'AgACAgQAAxkBAAECdbRng2ht0WiRYZE9iMKIQuEJG8O0_QACyMUxGydWGVCyLHmVUZz5yQEAAwIAA20AAzYE', // file_id of the image

  // Step 3: Extract the referral code from the /start command
  private extractReferralCode(text: string): string {
    const params = text.split(' ');
    return params.length > 1 ? params[1] : null;
  }

  // Step 4: Function to send message with image, caption, and inline buttons
  private async sendMessage(chatId: string, text: string, miniAppUrl: string, channelUrl: string) {
    const token = '7629971501:AAGXQE13v9Anu6Gf8hRbVKYeCnHhppyA_Ko'; // Replace with your bot's token
    const url = `https://api.telegram.org/bot${token}/sendPhoto`; // Sending a photo message

    const resualt =  await axios.post(url, {
      chat_id: chatId,
      //photo: fileId, // Using the file_id instead of a URL
      caption: text, // Caption under the image
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open Mini App',
              url: miniAppUrl, // Mini app deep link with referral code
            },
            {
              text: 'Open Channel',
              url: channelUrl, // Link to your channel
            },
          ],
        ],
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(resualt)

  }

}
