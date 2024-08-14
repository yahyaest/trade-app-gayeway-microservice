import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs/promises';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { CustomLogger } from 'src/myLogger';

const logger = new CustomLogger('Main');

async function read_routes_file(filePath) {
  try {
    // Read the file asynchronously
    const data = await fs.readFile(filePath, 'utf8');

    // Parse the JSON data
    const jsonData = JSON.parse(data);
    logger.log('Routes :', jsonData);
    return jsonData;
  } catch (err) {
    logger.error('Error reading or parsing the file:', err);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const app = await NestFactory.create(AppModule, { bodyParser: false }); // bodyParser false generate error with prisma
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();

  const routes = await read_routes_file('routes.json');

  for (const route of routes) {
    app.use(
      route.route,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        secure: false,
        on: {
          proxyReq: (proxyReq, req, res) => {
            logger.log(
              `Proxing ${req.method} request originally made to ${req.url} for service ${route.service}`,
            );
          },
        },
      }),
    );
  }

  await app.listen(3000);
}
bootstrap();
