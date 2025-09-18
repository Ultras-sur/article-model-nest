import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { compare, genSalt, hash } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import RegisterDto from './dto/register.dto';
import { User } from 'entity/user.entity';
import TokenPayload from './tokenPayload.interface';


@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}


  async register(registrationData: RegisterDto): Promise<User> {
    const userIsExist = await this.userService.findUserByLogin(registrationData?.login);
    if (userIsExist) {
      throw new HttpException(`User with login ${registrationData.login} is already exists!`, HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await hash(registrationData.password, 10);
    let createdUser;
    try {
      createdUser = await this.userService.createUser({ ...registrationData, password: hashedPassword});
      createdUser.password = 'undefined';
      return createdUser;
    } catch (err) {
      throw new HttpException('User is not created', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUser(userData: LoginDTO) {
    const { login, password } = userData;
    const user = await this.userService.findUserByLogin(login);
    if (user && (await compare(password, user.password.toString()))) {
      user.password = 'undefined';
      return user;
    } else
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);;
  }

  async createJwtAccessToken(payload: TokenPayload, options) {
    return this.jwtService.sign(payload, options);
  }

  async getCookieWithJwtToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = await this.createJwtAccessToken(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: `${this.configService.get('JWT_EXPIRATION_TIME')}s`
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
  }

  async getCookieWithJwtRefreshToken(userId: string) {
    const payload: TokenPayload = { userId };
    const refreshToken = await this.createJwtAccessToken(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`});
      const refreshTokenCookie = `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
      return { refreshTokenCookie, refreshToken };
    };
  

  getCookieForLogout () {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0'
    ];
  }
}