import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    try {
      return this.authService.signup(dto);
    } catch (error) {
      console.log(`Failed to create user: ${error.message}`);
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    try {
      return this.authService.signin(dto);
    } catch (error) {
      console.log(`Wrong credentials: ${error.message}`);
      throw new HttpException('Wrong credentials', HttpStatus.FORBIDDEN);
    }
  }
}
