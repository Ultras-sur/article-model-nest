import { Controller, Delete, HttpStatus, Patch, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Body, Param, Post, Get, Query, UseInterceptors, Logger  } from '@nestjs/common';
import { FindOptionsDto } from './dto/find-options.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import  JwtAuthenticatedGuard  from '../auth/guards/jwt-authenticated.guard';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { Article } from 'entity/article.entity';
import { PageDTO } from './dto/page.dto';

@ApiTags('Article')
@Controller('article')
export class ArticleController {
  private readonly logger = new Logger(ArticleController.name);
  constructor(private readonly articleService: ArticleService, 
    @Inject(CACHE_MANAGER) private cacheService: Cache) {}
  
  @Get()// обработает GET http://localhost/article?author={authorId}&page={page}&take={take}
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  // #region API description
  @ApiOperation({ summary: "Returns articles with query params (pagination)" })
  @ApiParam({ name: "page", type: 'string', required: false, description: "Number of page" })
  @ApiParam({ name: "take", type: 'string', required: false, description: "Number of articles per page" })
  @ApiParam({ name: "author", type: 'string', required: false, description: "Author of articles" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", type: PageDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // #endregion
  async findAllArticles(@Query() query: FindOptionsDto) {
    console.log(query)
    const articles = await this.articleService.getArticlesPaginate(query);
    return articles;
  }

  @CacheTTL(30)
  @Get(':id') // обработает GET http://localhost/article/{id}
  // #region API description
  @ApiOperation({ summary: "Gets article with specified id" })
  @ApiParam({ name: "id", required: true, description: "Article identifier" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", type: Article })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // #endregion
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
    await this.cacheService.del(id.toString());
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
    const deletedArticle = await this.articleService.deleteArticle(id);
    return res.status(HttpStatus.OK).json({ message: 'Article deleted successfully', article: deletedArticle })
  }
}