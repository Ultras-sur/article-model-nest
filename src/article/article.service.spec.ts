import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../app.module';
import { FindOptionsDto } from './dto/find-options.dto';
import { Article } from './../../entity/article.entity';
import { UserService } from './../user/user.service';
import { User } from 'entity/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { PageDTO } from './dto/page.dto';
import { resolve } from 'path';

function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

function generateArticleFixtures(quantity) {
  const articles = [];
  for (let number = 0; number <= quantity; number += 1) {
    articles.push({
      title: `Paper${number}`,
      description: `Article of paper${number}`,
    });
  }
  return articles;
}

describe('ArticleService', () => {
  let app: INestApplication;
  let articleService: ArticleService;
  let userService: UserService;
  let createdArticles: Article[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    articleService = app.get<ArticleService>(ArticleService);
    userService = app.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(articleService).toBeDefined();
  });

  describe('create articles', () => {
    let authors: User[];
    const fixtures: CreateArticleDto[] = generateArticleFixtures(15);
    beforeEach(async () => {
      authors = await userService.findAll();
    });
    it('created', async () => {
      await Promise.all(
        fixtures.map(async (article) => {
          const author = authors[getRandomInt(0, authors.length - 1)];
          const createdArtecle = await articleService.createArticle({...article, author,});
          createdArticles.push(createdArtecle)
        }),
      );
    });
  });
  describe('get one article', () => {
    it('finded one', async () => {
      await Promise.all(
        createdArticles.map(async (article) => {
          const findedArticle = await articleService.getArticle(article.id);
          expect(findedArticle).toBeInstanceOf(Article);
          expect(findedArticle.id).toEqual(article.id);
        }),
      );
    });
  });
  describe('getArticles []', () => {
    it('returned array of articles entity', async () => {
      const articles = await articleService.getArticles({});
      expect(Array.isArray(articles)).toBe(true);
      articles.map((article) => {
        expect(article).toBeInstanceOf(Article);
      });
    });
  });

  describe('findArticlesPaginate', () => {
    const metaFixtures = [
      { take: 2, page: 2 },
      { take: 4, page: 3 },
      { take: 5, page: 1 },
    ];
    let articlesAndCount: [Article[], number];
    beforeEach(async () => {
      articlesAndCount = await articleService.findArticlesAndCount({});
    });
    it('returned instance of page', async () => {
      const page = await articleService.getArticlesPaginate(
        new FindOptionsDto({}),
      );
      expect(page).toBeInstanceOf(PageDTO);
    });

    it('to have authors', async () => {
      const { data } = await articleService.getArticlesPaginate(
        new FindOptionsDto({}),
      );
      await Promise.all(
        data.map(async (article) => {
          const user = await userService.findUserById(article.author.id);
          expect(user.id).toEqual(article.author.id);
        }),
      );
    });

    describe('page meta information', () => {
      it('page, count, total pages', async () => {
        await Promise.all(
          metaFixtures.map(async (options) => {
            const { meta } = await articleService.getArticlesPaginate(
              new FindOptionsDto(options),
            );
            const [, count] = articlesAndCount;
            const totalPages = Math.ceil(count / options.take);
            expect(count).toEqual(meta.articlesCount);
            expect(meta.totalPages).toEqual(totalPages);
            expect(meta.page).toEqual(options.page);
          }),
        );
      });
    });
  });

  describe('update article', () => {
    it('return updated article', async () => {
      let updateFixtures = [
        { title: 'update, description: updated1' },
        { title: 'update2, description: updated2' },
        { title: 'update3, description: updated3' },
      ];
      await Promise.all(
        updateFixtures.map(async (fixture, index) => {
          const updatedArticle = await articleService.updateArticle(
            createdArticles[index].id,
            fixture,
          );
          expect(updatedArticle).toBeInstanceOf(Article);
          expect(updatedArticle.id).toEqual(createdArticles[index].id);
        }),
      );
    });
  });


  describe('delete Article', () => {
    it('return deleted entity', async () => {
      await Promise.all(
        createdArticles.map(async (article) => {
          const deletedArticle = await articleService.deleteArticle(article.id);
          expect(deletedArticle).toBeInstanceOf(Article);
        }),
      );
    });
    it('check deleted in database', async () => {
      await Promise.all(
        createdArticles.map(async (article) => {
          const deletedArticle = await articleService.getArticle(article.id);
          expect(deletedArticle).toBe(null);
        }),
      );
    });
  });
});
