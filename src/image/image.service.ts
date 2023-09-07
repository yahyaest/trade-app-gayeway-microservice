import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateImageDto, UpdateImageDto } from './dto';
import { CustomRequest } from 'src/user/models/request.models';

@Injectable()
export class ImageService {
 constructor(private readonly prisma: PrismaService) {}


 async getImages() {
  return await this.prisma.image.findMany();
}

async getImage(id: string) {
  return await this.prisma.image.findUnique({ where: { id: +id } });
}

async getImageByEmail(username: string) {
  return await this.prisma.image.findUnique({ where: { username: username } });
}

async getCurrentImage(req: CustomRequest) {
  return await this.prisma.image.findUnique({where: { username: req.user.email }})
}

async addImage(body: CreateImageDto) {
  return await this.prisma.image.create({ data: body });
}
async updateImage(id: string, body: UpdateImageDto) {
  return await this.prisma.image.update({
    where: { id: +id },
    data: body,
  });
}
async removeImage(id: string) {
  return await this.prisma.image.delete({ where: { id: +id } });
}
}
