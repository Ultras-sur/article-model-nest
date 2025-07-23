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
require('dotenv').config();



const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  logger: getLogLevels(process.env.NODE_ENV === 'production')
  app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
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
  
  await redisClient.connect();
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
