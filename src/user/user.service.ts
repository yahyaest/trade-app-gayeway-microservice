import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { CustomRequest } from './models/request.models';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserModel() {
    const users = await this.prisma.user.findMany();
    const user = users[0];
    let userModel = {};
    for (const key of Object.keys(user)) {
      userModel[key] = typeof user[key];
    }
    return userModel;
  }

  async getUsers() {
    return await this.prisma.user.findMany();
  }

  async getUser(id: string) {
    return await this.prisma.user.findUnique({ where: { id: +id } });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email: email } });
  }

  getCurrentUser(req: CustomRequest): User {
    return req.user;
  }

  async getUsersWithParams(query: Object) {
    const userModel = await this.getUserModel();
    for (const key of Object.keys(query)) {
      if (userModel[key] === 'number') {
        query[key] = parseInt(query[key]);
      }
    }
    return await this.prisma.user.findMany({
      where: query,
      // orderBy: { username: 'asc' },
    });
  }

  async addUser(body: CreateUserDto) {
    return await this.prisma.user.create({ data: body });
  }

  async updateUser(id: string, body: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id: +id },
      data: body,
    });
  }

  async removeUser(id: string) {
    return await this.prisma.user.delete({ where: { id: +id } });
  }
}
