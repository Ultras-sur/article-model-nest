export class PageMetaDTO {
  readonly page: number;
  readonly take: number;
  readonly totalPages: number;
  readonly articlesCount: number;

  constructor(articlesCount, findOptions) {
    this.page = findOptions.page;
    this.take = findOptions.take;
    this.articlesCount = articlesCount;
    this.totalPages = Math.ceil(this.articlesCount / this.take);
  }
}