import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: "Note identifier", nullable: false })
  id: string;

  @Column()
  @ApiProperty({ description: "Article title", nullable: false })
  title: string;

  @Column()
  @ApiProperty({ description: "Article description", nullable: false })
  description: string;

  @Column()
  @ApiProperty({ description: "Article created date", nullable: false })
  createdAt: Date;

  @Column({ nullable: true })
  @ApiProperty({ description: "Article updated date", nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.articles)
  @ApiProperty({ type: () => User, description: "Article author id", nullable: false })
  author: User;
}
