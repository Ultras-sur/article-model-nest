import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './create-user.dto';
import { ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../../entity/user.entity';
import JwtAuthenticatedGuard from '../../src/auth/guards/jwt-authenticated.guard';
import { example_users } from './api-examples/users';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    @Get()// обработает GET http://localhost/user
    // #region API description
    @ApiOperation({ summary: "Returns all users" })
    @ApiOkResponse({ example: example_users})
    @ApiResponse({ status: HttpStatus.OK, description: "Success" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
    // #endregion
    async getUsers() {
        return this.userService.findAll();
    }

    @Get(":id")// обработает GET http://localhost/user/{id}
    // #region API description
    @ApiOperation({ summary: "Return user with specified id" })
    @ApiParam({ name: "id", required: true, description: "User identifier" })
    @ApiOkResponse({ example: { id: '123', login: 'login', name: 'name'}})
    @ApiResponse({ status: HttpStatus.OK, description: "Success"})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
    // #endregion
    async getUser(@Param("id") id: string ) {
        const findedUser = await this.userService.findUserById(id);
        findedUser.password = 'undefined';
        findedUser.hashedRefreshToken = 'undefined';
        return findedUser;
    }
    @UseGuards(JwtAuthenticatedGuard)
    @Post()// обработает POST http://localhost/user
    // #region API description
      @ApiOperation({ summary: "Creates a new user" })
      @ApiResponse({ status: HttpStatus.OK, description: "Success", type: User })
      @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
      @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
      // #endregion
    async createUser(@Body() createUserData: CreateUserDTO) {
        console.log(createUserData)
        const createdUser = await this.userService.createUser(createUserData);
        return createdUser;
    }
}
