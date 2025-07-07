import { User } from "entity/user.entity";

export class FindOptionsDto {
  readonly order?: 'ASC' | 'DESC' = 'ASC';
  readonly created?: Date;
  readonly page?: number = 1;
  readonly take?: number = 10;
  readonly author?: string;
  get skip(): number {
    return (this.page - 1) * this.take ;
  }

  constructor(params) {
    this.page = params?.page ?? 1;
    this.author = params?.author ?? null;
    this.created = params?.created ?? null;
  }
}
