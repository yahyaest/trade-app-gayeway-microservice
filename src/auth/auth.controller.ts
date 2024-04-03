import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { CustomLogger } from 'src/myLogger';
import { Response } from 'express'

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService, private config: ConfigService) {}
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
  async signin(@Body() dto: AuthDto,  @Res({passthrough:true}) res: Response) {
    try {
      this.logger.log(`Sigin user with email ${dto.email}`);
      const tokenResponse = await this.authService.signin(dto);

      // Set HTTP-only cookie for the token
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
      const CLIENT_DOMAIN = this.config.get('CLIENT_DOMAIN');
      res.cookie('token', tokenResponse.access_token, {
        httpOnly: true, 
        domain: CLIENT_DOMAIN ? CLIENT_DOMAIN : 'localhost',
        sameSite: 'none',
        secure: true,
        //// In prod server and front should have some domain. eg : front example.io and back/server api.example.io
        // domain: '192.168.208.7',  //front app domain (not sure need check)
        // sameSite: 'strict',
        // secure: true, 
      });

      return tokenResponse
    } catch (error) {
      this.logger.error(`Wrong credentials: ${error.message}`);
      throw new HttpException('Wrong credentials', HttpStatus.FORBIDDEN);
    }
  }
}
