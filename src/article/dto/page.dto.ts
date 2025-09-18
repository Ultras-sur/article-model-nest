import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDTO } from './page-meta.dto';
import { Article } from 'entity/article.entity';

export class PageDTO<T> {
  @ApiProperty({ description: "Array of articles", type: Article, isArray: true })
  readonly data: T[];
  @ApiProperty({ description: "Metadata of page"})
  readonly meta: PageMetaDTO;

  constructor(data: T[], meta: PageMetaDTO) {
    this.data = data;
    this.meta = meta;
  }
}