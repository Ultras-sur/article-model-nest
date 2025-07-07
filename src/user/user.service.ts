import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './create-user.dto';
const bcrypt = require('bcryptjs');


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

    async getUser(id: string): Promise<User | null> {
        const findedUser = await this.userRepository.findOneBy({ id });
        if (!findedUser) {
            throw new NotFoundException(`User with id: ${id} is not found!`);
        }
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
        console.log(0)
        const {name, login, password} = createUserDTO;
        console.log(1)
        const userIsExist = await this.findUserByLogin(login);
        
        console.log(2)
        if (userIsExist) {
            throw new HttpException(`User with login ${login} is already exists!`, HttpStatus.BAD_REQUEST);
        }
        let createdUser;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            createdUser = this.userRepository.create({
                name, login, password: hashedPassword
            });
            await this.userRepository.save(createdUser);
        } catch(error) {
            if (error) {
                throw new HttpException('User is not created', HttpStatus.BAD_REQUEST);
            }
        }
        return this.sanitizeUser(createdUser);
    }

    sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
