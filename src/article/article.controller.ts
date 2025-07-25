import { Controller, Delete, Patch, Res, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Body, Param, Post, Get, Query, UseInterceptors, Logger  } from '@nestjs/common';
import { FindOptionsDto } from './dto/find-options.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CacheInterceptor, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Controller('article')
export class ArticleController {
  private readonly logger = new Logger(ArticleController.name);
  constructor(private readonly articleService: ArticleService, 
    @Inject(CACHE_MANAGER) private cacheService: Cache) {}
  
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async findAllArticles(@Query() query: FindOptionsDto) {
    const articles = await this.articleService.getArticlesPaginate(query);
    return articles;
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('/all')
  async findAll() {
    const articles = await this.articleService.getArticles({});
    return articles;
  }

  @CacheTTL(30)
  @Get(':id')
  async findArticle(@Param('id') id: string) {
    const cachedData = await this.cacheService.get(id.toString());
    if(cachedData) {
      console.log('Getting data from cache!')
      return cachedData;
    }
    const findedArticle = await this.articleService.getArticle(id);
    await this.cacheService.set(id.toString(), findedArticle)
    return findedArticle;
  }
  @UseGuards(AuthenticatedGuard)
  @Post()
  async createArticle(@Body() createArticleDto: CreateArticleDto) {
    const createdArticle =
      await this.articleService.createArticle(createArticleDto);
    return createdArticle;
  }
  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  async updateArticle(@Param('id') id, @Body() updateArticle: UpdateArticleDto) {
    await this.cacheService.del(id.toString());
    const updatedArticle = await this.articleService.updateArticle(id, updateArticle);
    return updatedArticle;
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  async deleteArticle (@Res() res, @Param('id') id) {
    await this.articleService.deleteArticle(id);
    return res.redirect('/');
  }

}