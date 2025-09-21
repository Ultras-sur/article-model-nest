import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from './../../entity/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../infrastructure/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), RedisModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService]
})
export class ArticleModule {}
