import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';
import { UserModule } from '../user/user.module';  // Import UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Photo]),
    forwardRef(() => UserModule),  // Use forwardRef to resolve circular dependencies
  ],
  providers: [PhotoService],
  controllers: [PhotoController],
  exports: [PhotoService],
})
export class PhotoModule {}
