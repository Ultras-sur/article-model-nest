import { AuthService } from "./auth.service";
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { UserService } from '../user/user.service';
import mockedUser from './mockedUser';
import * as bcrypt from 'bcryptjs';
import mockedConfigService from "./mocks/config.service";
import mockedJwtService from "./mocks/jwt.service";

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let bcryptCompare: jest.Mock;
    let userData: User;
    let findUser: jest.Mock;
    beforeEach(async () => {
        bcryptCompare = jest.fn().mockReturnValue(true);
        (bcrypt.compare as jest.Mock) = bcryptCompare;
 
        userData = {
          ...mockedUser
        }
        findUser = jest.fn().mockResolvedValue(userData);
        const userRepository = {
            findOne: findUser
        }

        const module = await Test.createTestingModule({
            providers: [
                UserService,
                AuthService,
                { 
                    provide: ConfigService, 
                    useValue: mockedConfigService  
                },
                {
                    provide: JwtService,
                    useValue: mockedJwtService
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: userRepository
                }
            ]
        }).compile();
        authService = await module.get(AuthService);
        userService = await module.get(UserService);

    })
    describe('authenticating user', () => {
        describe('password is not valid', () => {
            beforeEach(() => {
                bcryptCompare.mockReturnValue(false);
            });
            it('should throw an error', async () => {
                await expect(authService.validateUser({ login: userData.login, password: userData.password }))
                .rejects.toThrow();
            })
        })
        describe('password is valid', () => {
            beforeEach(() => {
                //jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true))
                bcryptCompare.mockReturnValue(true);
            })
            describe('user is found in database', () => {
                beforeEach(() => {
                    findUser.mockResolvedValue(userData);
                })
                it('return user data', async () => {
                    const user = await authService.validateUser({ login: userData.login, password: userData.password });
                    expect(user).toBe(userData);
                })
            })
            describe('user is not found in database', () => {
                beforeEach(() => {
                    findUser.mockResolvedValue(null);
                })
                it('should throw an error', async () => {
                    await expect(authService.validateUser({ login: userData.login, password: userData.password }))
                    .rejects.toThrow();
                })
            })
        })
    })
});

