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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { CreateUserDto, UpdateUserDto } from './dto';
import { CustomRequest } from './models/request.models';
import { UserService } from './user.service';
import { CustomLogger } from 'src/myLogger';

@UseGuards(JwtGuard, RolesGuard)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new CustomLogger(UserController.name);

  @Get('')
  @Roles('ADMIN')
  async getUsersWithParams(@Query() query: Object) {
    //  return await this.userService.getUsersWithParams(query);

    try {
      this.logger.log('Getting users...');
      return await this.userService.getUsersWithParams(query);
    } catch (error) {
      this.logger.error(`Failed to retrieve users: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('/me')
  getCurrentUser(@Req() req: CustomRequest) {
    return this.userService.getCurrentUser(req);
  }

  @Get('/:id')
  async getUser(@Param('id') id: string, @Req() req: CustomRequest) {
    try {
      const currentUser = req.user;
      const user = await this.userService.getUser(id);
      if (!user) {
        throw new Error('User not found');
      }
      if (currentUser.email !== user.email && currentUser.role !== 'ADMIN') {
        throw new Error('Data belong to another user');
      }
      return user; 
    } catch (error) {
      this.logger.error(`Failed to retrieve user: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('')
  async addUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.addUser(createUserDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: CustomRequest
  ) {
    try {
      const currentUser = req.user;
      const user = await this.userService.getUser(id);
      if (!user) {
        throw new Error('User not found');
      }
      if (currentUser.email !== user.email && currentUser.role !== 'ADMIN') {
        throw new Error('Data belong to another user');
      }
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/:id')
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: string) {
    // return await this.userService.removeUser(id);
    try {
      const user = await this.userService.removeUser(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(`Failed to retrieve user: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('/is_user')
  async isUser(@Body() body: { email: string }) {
    try {
      const user = await this.userService.getUserByEmail(body.email);
      if (!user) return false;
      this.logger.log(`User with email ${body.email} exist.`);
      return true;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
