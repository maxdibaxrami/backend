import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Existing route
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // New route to display Telegram Mini App init data
  @Get('api/init-data')  // Use /api/init-data for the new route
  showInitData(@Req() request: Request) {
    const initData = request['initData'];  // Extract init data from the request
    if (!initData) {
      throw new Error('Init data not found');  // Handle missing init data
    }
    return initData;  // Return the parsed init data as the response
  }
}
