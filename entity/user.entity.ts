import { Entity, OneToMany, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public login: string;

  @Column()
  public name: string;

  
  @OneToMany(() => Article, (article) => article.author)
  public articles: Article[];

  @Column()
  public password: string;
}
