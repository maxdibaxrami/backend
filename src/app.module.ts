import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LikeModule } from './like/like.module';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { PhotoModule } from './photo/photo.module';
import { TelegramModule } from './telegram/telegram.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Allows ConfigService to be used globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true, // Automatically load entities
        synchronize: true, // Sync schema (disable in production)
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path to your 'uploads' folder
      serveRoot: '/uploads', // This will make files accessible via '/uploads' URL path
    }),
    AuthModule,
    UserModule,
    LikeModule,
    MatchModule,
    ChatModule,
    MessageModule,
    PhotoModule,
    TelegramModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
