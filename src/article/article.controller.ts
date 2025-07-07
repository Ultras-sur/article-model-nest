import { Controller, Patch, Res, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Body, Param, Post, Get, Query, UseInterceptors } from '@nestjs/common';
import { FindOptionsDto } from './dto/find-options.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CacheInterceptor, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService, 
    @Inject(CACHE_MANAGER) private cacheService: Cache) {}
  
  @Get()
  async findAllArticles(@Query() query: FindOptionsDto) {
    console.log(query);
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
    const updatedArticle = await this.articleService.updateArticle(id, updateArticle);
    return updatedArticle;
  }
}