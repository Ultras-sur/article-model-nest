import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class PageMetaDTO {
  
  @ApiProperty({ description: "Number of page"})
  @IsNumber()
  @Min(1)
  readonly page: number;
  @ApiProperty({ description: "Number of articles per page"})
  @IsNumber()
  @Min(1)
  readonly take: number;
  @IsNumber()
  @ApiProperty({ description: "Page count"})
  readonly totalPages: number;
  @IsNumber()
  @ApiProperty({ description: "Articles count"})
  readonly articlesCount: number;

  constructor(articlesCount, findOptions) {
    this.page = findOptions.page;
    this.take = findOptions.take;
    this.articlesCount = articlesCount;
    this.totalPages = Math.ceil(this.articlesCount / this.take);
  }
}