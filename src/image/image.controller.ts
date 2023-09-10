import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { ImageService } from './image.service';
import { Roles } from 'src/auth/decorator';
import { CustomLogger } from 'src/myLogger';
import { CustomRequest } from 'src/user/models/request.models';
import { CreateImageDto, UpdateImageDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from 'src/user/user.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('api/images')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly userService: UserService,
  ) {}
  private readonly logger = new CustomLogger(ImageController.name);

  @Get('')
  @Roles('ADMIN')
  async getImages() {
    try {
      this.logger.log('Getting images...');
      return await this.imageService.getImages();
    } catch (error) {
      this.logger.error(`Failed to retrieve images: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('/me')
  getCurrentImage(@Req() req: CustomRequest) {
    return this.imageService.getCurrentImage(req);
  }

  @Get('/:id')
  async getImage(@Param('id') id: string, @Req() req: CustomRequest) {
    try {
      const user = req.user;
      const image = await this.imageService.getImage(id);
      if (!image) {
        throw new Error('Image not found');
      }
      if (user.email !== image.username && user.role !== 'ADMIN') {
        throw new Error('Image belong to another user');
      }
      return image;
    } catch (error) {
      this.logger.error(`Failed to retrieve image: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          //Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async addImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
    @Req() req: CustomRequest,
  ) {
    try {
      createImageDto.filename = file.filename;
      const currentUser = this.userService.getCurrentUser(req);
      if (currentUser) {
        createImageDto.userId = currentUser.id;
      }
      return await this.imageService.addImage(createImageDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/:id')
  async updateImage(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
    @Req() req: CustomRequest,
  ) {
    try {
      const user = req.user;
      const image = await this.imageService.getImage(id);
      if (!image) {
        throw new Error('Image not found');
      }
      if (user.email !== image.username && user.role !== 'ADMIN') {
        throw new Error('Image belong to another user');
      }
      return await this.imageService.updateImage(id, updateImageDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/:id')
  async deleteImage(@Param('id') id: string, @Req() req: CustomRequest) {
    try {
      const user = req.user;
      const image = await this.imageService.getImage(id);
      if (!image) {
        throw new Error('Image not found');
      }
      if (user.email !== image.username && user.role !== 'ADMIN') {
        throw new Error('Image belong to another user');
      }
      return await this.imageService.removeImage(id);
    } catch (error) {
      this.logger.error(`Failed to retrieve image: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
