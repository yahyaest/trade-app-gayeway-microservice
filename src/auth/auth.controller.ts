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
import { CustomLogger } from 'src/myLogger';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  private readonly logger = new CustomLogger(AuthController.name);

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    try {
      return this.authService.signup(dto);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    try {
      this.logger.log(`Sigin user with email ${dto.email}`)
      return this.authService.signin(dto);
    } catch (error) {
      this.logger.error(`Wrong credentials: ${error.message}`);
      throw new HttpException('Wrong credentials', HttpStatus.FORBIDDEN);
    }
  }
}
