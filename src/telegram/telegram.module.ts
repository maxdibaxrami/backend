import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module'; // Import UserModule here

@Module({
  imports: [UserModule], // Add UserModule to imports
  controllers: [TelegramController],
})
export class TelegramModule {}
