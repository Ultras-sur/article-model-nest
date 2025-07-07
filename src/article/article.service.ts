import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Article } from '../../entity/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDTO } from './dto/page-meta.dto';
import { PageDTO } from './dto/page.dto';
import { FindOptionsDto } from './dto/find-options.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>
  ) {}

  async getArticle(id: string): Promise<Article | null> {
    const findedArticle = await this.articleRepository.findOneBy({ id });
    if (!Article) {
      throw new NotFoundException(`Article whith id: ${id} is not found!`);
    }
    return findedArticle;
  }

  async getArticles(condition = {}): Promise<Article[]> {
    const articles = await this.articleRepository.find(condition);
    return articles;
  }

  async getArticlesPaginate(findOptions: FindOptionsDto): Promise<PageDTO<Article>> {
    const articlesAndCount = await this.articleRepository.findAndCount({
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        author: { id: true }
      },
      relations: {
        author: true,
      },
      where: {
        createdAt: findOptions.created ?? null, // format date ?
        author: {
          id: findOptions.author ?? null,
        }
      },
      order: {
        createdAt: findOptions.order,
      },
      skip: findOptions.skip,
      take: findOptions.take,
    });
    console.log(findOptions.skip)
    const [ articles, articlesCount ] = articlesAndCount;
    console.log(articlesAndCount)
    const pageMeta = new PageMetaDTO(articlesCount, findOptions);
    return new PageDTO(articles, pageMeta);
  }

  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    const cretedArticle = this.articleRepository.create(createArticleDto);
    try {
      await this.articleRepository.save(cretedArticle);
    } catch(error) {
        if (error) {
          throw new HttpException('Article is not created', HttpStatus.BAD_REQUEST);
        }
    return cretedArticle;
    }
  }

  async updateArticle(id: string, updateArticle: UpdateArticleDto): Promise<Article | null> {
      const article = await this.getArticle(id);
    if(!article) {
      throw new NotFoundException(`Article whith id: ${id} is not found!`);
    }
    await this.articleRepository.update(id, updateArticle);
    return this.getArticle(id);
  }

  async deleteArticle(id: string): Promise<Article> {
    const deletedArticle = await this.getArticle(id);
    try {
      if (!deletedArticle) throw new Error('Not found');
      await this.articleRepository.delete(deletedArticle.id);
    } catch (err) {
      if (err) {
        throw new HttpException(`Article is not deleted: ${err.message}` , HttpStatus.BAD_REQUEST);
      }
    }
    return deletedArticle;
  }
}
