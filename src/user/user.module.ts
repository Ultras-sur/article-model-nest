import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from 'entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CacheModule.register()],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
