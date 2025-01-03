import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Existing route
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
