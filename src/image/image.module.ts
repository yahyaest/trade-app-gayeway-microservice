import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ImageService, UserService],
  controllers: [ImageController]
})
export class ImageModule {}
