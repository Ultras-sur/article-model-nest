import { IsString } from 'class-validator';
export class UpdateArticleDto {
  @IsString()
  title?: string;
  @IsString()
  description?: string;
}
