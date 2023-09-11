import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { CustomLogger } from 'src/myLogger';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  private readonly logger = new CustomLogger(AuthService.name);

  async signup(dto: AuthDto) {
    // Check user exist
    let user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user)
      throw new HttpException(
        `User with email ${dto.email} already exist`,
        HttpStatus.FORBIDDEN,
      );
    // Generate the password hash
    const hash = await argon.hash(dto.password);
    // Save the new user in the db
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          role: dto.role ? dto.role : 'USER',
          username: dto.username ? dto.username : null,
          phone: dto.phone ? dto.phone : null,
        },
      });

      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does not exist throw exception
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    try {
      // compare password
      const pwMatches = await argon.verify(user.password, dto.password);
      // if password incorrect throw exception
      if (!pwMatches)
        throw new HttpException(
          'Credentials incorrect',
          HttpStatus.UNAUTHORIZED,
        );
      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
    }
  }

  async signToken(
    userId: number,
    email: string,
    role: 'ADMIN' | 'USER',
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
