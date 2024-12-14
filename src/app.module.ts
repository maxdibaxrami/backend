import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LikeModule } from './like/like.module';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService globally available
      envFilePath: '.env', // Ensure to point to the correct env file
    }),
    // Configure TypeORM with Supabase PostgreSQL database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'), // Supabase Host
        port: +configService.get<number>('DATABASE_PORT'), // Port
        username: configService.get('DATABASE_USER'), // Database user
        password: configService.get('DATABASE_PASSWORD'), // Database password
        database: configService.get('DATABASE_NAME'), // Database name
        url: configService.get('DATABASE_URL'), // Full connection URL (optional)
        ssl: {
          rejectUnauthorized: false, // Enable SSL for Supabase connection
        },
        autoLoadEntities: true, // Automatically load entities (from the "entities" array in modules)
        synchronize: process.env.NODE_ENV !== 'production', // Sync schema in development only (disable in production)
      }),
    }),
    // Import other feature modules
    AuthModule,
    UserModule,
    LikeModule,
    MatchModule,
    ChatModule,
    MessageModule,
  ],
  controllers: [AppController], // Define application controllers
  providers: [AppService], // Define application services
})
export class AppModule {}
