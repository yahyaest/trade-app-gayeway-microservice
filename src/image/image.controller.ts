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

@UseGuards(JwtGuard, RolesGuard)
@Controller('api/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}
  private readonly logger = new CustomLogger(ImageController.name);

  @Get('')
  @Roles('ADMIN')
  async getImagesWithParams() {
    try {
      this.logger.log('Getting images...');
      return await this.imageService.getImages();
    } catch (error) {
      this.logger.error(`Failed to retrieve images: ${error.message}`);
      throw new HttpException('No images found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('/me')
  getCurrentImage(@Req() req: CustomRequest) {
    return this.imageService.getCurrentImage(req);
  }

  @Get('/:id')
  @Roles('ADMIN')
  async getImage(@Param('id') id: string) {
    try {
      const image = await this.imageService.getImage(id);
      if (!image) {
        throw new Error('Image not found');
      }
      return image;
    } catch (error) {
      this.logger.error(`Failed to retrieve image: ${error.message}`);
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
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
    @UploadedFile() file: Express.Multer.File, @Body() createImageDto: CreateImageDto
  ) {
    try {
      createImageDto.filename = file.filename;
      return await this.imageService.addImage(createImageDto);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/:id')
  async updateImage(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    try {
      return await this.imageService.updateImage(id, updateImageDto);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/:id')
  @Roles('ADMIN')
  async deleteImage(@Param('id') id: string) {
    try {
      const image = await this.imageService.removeImage(id);
      if (!image) {
        throw new Error('Image not found');
      }
      return image;
    } catch (error) {
      this.logger.error(`Failed to retrieve image: ${error.message}`);
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }
}
