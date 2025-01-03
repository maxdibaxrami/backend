import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'), // Correct path to 'uploads'
    serveRoot: '/uploads', // This will make files accessible via '/uploads' URL path
  }),
  // Enable CORS
  app.enableCors({
    origin: '*', // Allow all origins. You can specify a specific domain if needed.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: 'Content-Type, Accept', // Allow specific headers
  });

  // Start the application
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
