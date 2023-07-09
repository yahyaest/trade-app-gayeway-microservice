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

@UseGuards(JwtGuard, RolesGuard)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @Roles('ADMIN')
  async getUsersWithParams(@Query() query: Object) {
    //  return await this.userService.getUsersWithParams(query);

    try {
      return await this.userService.getUsersWithParams(query);
    } catch (error) {
      console.log(`Failed to retrieve users: ${error.message}`);
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('/me')
  getCurrentUser(@Req() req: CustomRequest) {
    return this.userService.getCurrentUser(req);
  }

  @Get('/:id')
  @Roles('ADMIN')
  async getUser(@Param('id') id: string) {
    // return await this.userService.getUser(id);
    try {
      const user = await this.userService.getUser(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.log(`Failed to retrieve user: ${error.message}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('')
  async addUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.addUser(createUserDto);
    } catch (error) {
      console.log(error);
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
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
      console.log(`Failed to retrieve user: ${error.message}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('/is_user')
  async isUser(@Body() body: {email:string}) {
    try {
      const user = await this.userService.getUserByEmail(body.email);
      if (!user) return false;
      return true;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
