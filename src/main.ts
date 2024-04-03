import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const config = new ConfigService();
  const CLIENT_URL = config.get('CLIENT_URL')
  const JWT_SECRET = config.get('JWT_SECRET')
  app.use(cookieParser(JWT_SECRET));
  // app.enableCors();
  app.enableCors({
    // origin: 'http://192.168.208.7:3000',
    origin: CLIENT_URL ? CLIENT_URL : 'http://localhost:3000',
    credentials: true,
  });
  // app.use((req, res, next) => {
  //   req.cookies.token
  //   res.setHeader('Access-Control-Allow-Origin', `${CLIENT_URL ? CLIENT_URL : 'http://localhost:3000'}`);
  //   res.setHeader('Access-Control-Allow-Credentials', 'true');
  //   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //   next();
  // });
  await app.listen(3000);
}
bootstrap();
