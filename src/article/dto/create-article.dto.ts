import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entity/user.entity';
import { IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ description: "Title of article", required: true})
  @IsString()
  title: string;
  @ApiProperty({ description: "Description to article", required: true})
  @IsString()
  description: string;
  @ApiProperty({ description: "UserId", required: true, type: User})
  @IsString()
  author: User;
}
