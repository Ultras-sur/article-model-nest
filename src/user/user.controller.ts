import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './create-user.dto';

@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    @Get()
    async getUsers() {
        return this.userService.findAll();
    }

    @Get(":id")
    async getUser(@Param("id") id: string ) {
        const findedUser = await this.userService.findUserById(id);
        findedUser.password = 'undefined';
        return findedUser;
    }
    
    @Post()
    async createUser(@Body() createUserData: CreateUserDTO) {
        console.log(createUserData)
        const createdUser = await this.userService.createUser(createUserData);
        return createdUser;
    }
}
