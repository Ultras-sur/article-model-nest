import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './entity/user.entity';
import { Article } from './entity/article.entity';
import { Migrations1758138985598 } from './1758138985598-migrations';


config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
      port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
            database: configService.get('POSTGRES_DB'),
              entities: [User, Article],
                migrations: [Migrations1758138985598]
                });