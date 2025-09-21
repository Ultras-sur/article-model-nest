import { BadRequestException, Controller, Delete, HttpException, HttpStatus, Patch, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Body, Param, Post, Get, Query, Logger  } from '@nestjs/common';
import { FindOptionsDto } from './dto/find-options.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import  JwtAuthenticatedGuard  from '../auth/guards/jwt-authenticated.guard';
import { ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { Article } from '../../entity/article.entity';
import { example_page } from './api-examples/articles-page';
import { GET_ARTICLE_CACHE_KEY } from './articleCacheKey.constant';
import { GET_ARTICLES_CACHE_LIST } from './articlesCacheList.constant';
import { RedisCacheService } from './../infrastructure/redis/redis-cache.service';


@ApiTags('Article')
@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService, 
    @Inject(RedisCacheService) private readonly redisCacheService: RedisCacheService ) {}
  
  @Get()// обработает GET http://localhost/article?author={authorId}&page={page}&take={take}
  // #region API description
  @ApiOperation({ summary: "Returns articles with query params (pagination)" })
  @ApiParam({ name: "page", type: 'string', required: false, description: "Number of page" })
  @ApiParam({ name: "take", type: 'string', required: false, description: "Number of articles per page" })
  @ApiParam({ name: "author", type: 'string', required: false, description: "Author of articles" })
  @ApiOkResponse({ schema: { example: example_page }})
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // #endregion
  async findAllArticles(@Query() query: FindOptionsDto, @Req() req) {
    const cachedData = await this.redisCacheService.getCachedData(GET_ARTICLES_CACHE_LIST, req._parsedUrl.search);
    if(cachedData) {
      console.log('Getting data from cache!')
      return cachedData;
    }
    const articles = await this.articleService.getArticlesPaginate(query);
    await this.redisCacheService.setCachedDataWithExpiry(GET_ARTICLES_CACHE_LIST, req._parsedUrl.search, JSON.stringify(articles), '30')
    return articles;
  }

  @Get(':id') // обработает GET http://localhost/article/{id}
  // #region API description
  @ApiOperation({ summary: "Gets article with specified id" })
  @ApiParam({ name: "id", required: true, description: "Article identifier" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", type: Article })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // #endregion
  async findArticle(@Param('id') id: string) {
    const cachedData = await this.redisCacheService.getCachedData(GET_ARTICLE_CACHE_KEY, id)
    if(cachedData) {
      console.log('Getting data from cache!')
      return cachedData;
    }
    const findedArticle = await this.articleService.getArticle(id);
    if(findedArticle) {
      await this.redisCacheService.setCachedDataWithExpiry(GET_ARTICLE_CACHE_KEY, id, JSON.stringify(findedArticle), '30')
    } else {
      throw new BadRequestException(`Article with id ${id} is not found!`)
    }
    return findedArticle;
  }

  @UseGuards(JwtAuthenticatedGuard)
  @Post() // обработает POST http://localhost/article
  // #region API description
  @ApiOperation({ summary: "Creates a new article" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", type: Article })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  // #endregion
  async createArticle(@Body() createArticleDto: CreateArticleDto) {
    const createdArticle =
      await this.articleService.createArticle(createArticleDto);
    await this.redisCacheService.clearCache(GET_ARTICLES_CACHE_LIST);
    return createdArticle;
  }
  
  @UseGuards(JwtAuthenticatedGuard)
  @Patch(':id') // обработает PUTCH http://localhost/article/{articleId}
  // #region API description
  @ApiOperation({ summary: "Update article with specified id" })
  @ApiParam({ name: "id", required: true, description: "Article identifier" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", type: Article })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  // #endregion
  async updateArticle(@Param('id') id, @Body() updateArticle: UpdateArticleDto) {
    const updatedArticle = await this.articleService.updateArticle(id, updateArticle);
    if (updatedArticle) {
     await this.redisCacheService.deleteCachedData(GET_ARTICLE_CACHE_KEY, id)
    } else {
      throw new BadRequestException(`Article with id ${id} is not found!`);
    }
    return updatedArticle;
  }

  @UseGuards(JwtAuthenticatedGuard)
  @Delete(':id')// обработает DELETE http://localhost/article/{articleId}
  // #region API description
  @ApiOperation({ summary: "Deletes article with specified id" })
  @ApiParam({ name: "id", required: true, description: "Article identifier" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", type: Article })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  // #endregion
  async deleteArticle (@Res() res, @Param('id') id) {
    try {
     await this.articleService.deleteArticle(id);
     await this.redisCacheService.deleteCachedData(GET_ARTICLE_CACHE_KEY, id);
     await this.redisCacheService.clearCache(GET_ARTICLES_CACHE_LIST);
    } catch(err) {
      throw new BadRequestException(err.message);
    }
    return res.status(HttpStatus.OK).json({ message: 'Article deleted successfully'});
  }
}