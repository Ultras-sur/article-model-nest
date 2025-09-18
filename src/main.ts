import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisStore } from "connect-redis"
import * as session from 'express-session';
import cookieParser = require('cookie-parser');
import passport = require('passport');
import getLogLevels from '../utils/logLevels';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
require('dotenv').config();



const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Notes API')
    .setDescription('The notes API description')
    .setVersion('1.0')
    .build();
  logger: getLogLevels(process.env.NODE_ENV === 'production')
  app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    //whitelist: true,
    //transformOptions: { enableImplicitConversion: true }
  }),
);

  
  const configService = app.get(ConfigService);
  const redisClient = createClient({
    socket: {
      port: configService.get('REDIS_PORT'),
      host: configService.get('REDIS_HOST'),
    },
  });
  redisClient.on('error', (error) => {
    logger.error('Redis in not connected: ' + error);
  });
  redisClient.on('connect', (error) => {
    logger.log('Redis is connected');
  });
  const redisStore = new RedisStore({
    client: redisClient,
  });
  app.use(
    session({
      store: redisStore,
      secret: configService.get('SESSION_KEY'),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await redisClient.connect();
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
