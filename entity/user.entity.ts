import { Entity, OneToMany, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from './article.entity';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: "UserId", nullable: false })
  public id: string;

  @ApiProperty({ description: "User login", nullable: false })
  @Column({ unique: true })
  public login: string;

  @ApiProperty({ description: "User name", nullable: false })
  @Column()
  public name: string;
  
  @ApiProperty({ description: "Articles created by the user" })
  @OneToMany(() => Article, (article) => article.author)
  public articles?: Article[];

  @Column()
  public password: string;

  @Column({ nullable: true })
  public hashedRefreshToken?: string;
}
