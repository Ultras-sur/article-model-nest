import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdateArticleDto {
  @ApiProperty({ description: "Title of article", required: true})
  @IsOptional()
  @IsString()
  readonly title?: string;
  @ApiProperty({ description: "Description to article", required: true})
  @IsOptional()
  @IsString()
  readonly description?: string;
}
