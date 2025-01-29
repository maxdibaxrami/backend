import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('message') message: string) {
    return this.notificationService.update(id, message);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Post()
  create(@Body('message') message: string, @Body('userId') userId: number) {
    return this.notificationService.createNotification(message, userId);
  }

}
