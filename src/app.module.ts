import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';
import { ImageModule } from './image/image.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ReverseProxyWalletMiddleware } from './middleware/proxy-wallet.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            colorizeObjects: true,
            singleLine: false,
            levelFirst: false,
            // minimumLevel: 'trace',
            translateTime: "yyyy-mm-dd'T'HH:MM:ss.l'Z'",
            messageFormat:
              '{req.headers.x-correlation-id} [{context}] - url:{req.url} - {msg} \n \n',
            //ignore: 'pid,hostname,context,req,res,responseTime',
            ignore: 'context',
            errorLikeObjectKeys: ['err', 'error'],
          },
        },
      },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//       consumer.apply(ReverseProxyWalletMiddleware)
//       .forRoutes({
//         path: 'trade-wallet/*', method: RequestMethod.ALL
//       });
//   }
// }
