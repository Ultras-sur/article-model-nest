import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './create-user.dto';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find({ select: {
            id: true,
            name: true,
            login:true,
        }});
  } 

    async getUser(id: string): Promise<User> {
        const findedUser = await this.userRepository.findOneBy({ id });
        /*if (!findedUser) {
           // throw new NotFoundException(`User with id: ${id} is not found!`);
           return null;
        }*/
        return findedUser;
    }

    async findUserByLogin(login: string): Promise<User | null> {
        const findedUser = await this.userRepository.findOne({ where: { login }});
        /*if (!findedUser) {
            throw new NotFoundException(`User with login: ${login} is not found!`);
        }*/
        return findedUser;
    }

    async findUserById(id: string): Promise<User> {
        const findedUser = await this.userRepository.findOne({ where: { id }});
        if (!findedUser) {
            throw new NotFoundException(`User with id: ${id} is not found!`);
        }
        return findedUser;
    }

    async createUser(createUserDTO: CreateUserDTO) : Promise<User> {
        let createdUser;
        try {
            createdUser = this.userRepository.create(createUserDTO);
            await this.userRepository.save(createdUser);
        } catch(error) {
            if (error?.code === '23505') {
              throw new HttpException(`User with login ${createUserDTO.login} is already exists`, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('User is not created', HttpStatus.BAD_REQUEST);
        }
        return createdUser;
    }

    async deleteUser(id: string): Promise<User> {
        const deletedUser = await this.getUser(id);
        try {
            if (!deletedUser) throw new Error('Not found');
                await this.userRepository.delete(deletedUser.id);
        } catch (err) {
            if (err) {
                throw new HttpException(`User is not deleted: ${err.message}` , HttpStatus.BAD_REQUEST);
            }
        }
        return deletedUser;
    }

    async getUserIfRefreshTokenMatch (refreshToken: string, userId: string) {
        const user = await this.getUser(userId);
        const tokenIsMatch = await compare(refreshToken, user.hashedRefreshToken);
        if(tokenIsMatch) {
            return user;
        }
    }

    async setRefreshToken(refreshToken: string, userId: string) {
        const hashedRefreshToken = await hash(refreshToken, 10);
        await this.userRepository.update(userId, {
            hashedRefreshToken
        });
    }

    async removeRefreshToken(userId: string) {
        return this.userRepository.update(userId, {
            hashedRefreshToken: null
    });
  }
}
