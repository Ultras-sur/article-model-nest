import { Body, Req, Controller, HttpCode, Post, UseGuards, ValidationPipe, Res, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import RequestWithUser from './requestWithUser.interface';
import RegisterDto from './dto/register.dto';
import { LoginGuard } from './guards/login.guard';
import JwtAuthenticatedGuard from './guards/jwt-authenticated.guard';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { UserService } from '../user/user.service';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
 
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtRefreshGuard) 
  @Get('refresh')  // Обработает GET http://localhost/auth/refresh
  // #region
  @ApiOperation({ summary: "Set cookie  with new jwt token" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" }) 
  // #endregion
  async refresh (@Req() req: RequestWithUser) {
    const jwtToken = await this.authService.getCookieWithJwtToken(req.user.id);
    req.res.setHeader('Set-Cookie', jwtToken);
    return req.user;
  }

  @Post('register')// Обработает GET http://localhost/auth/register
  // #region
  @ApiOperation({ summary: "Creates a new user" })
  @ApiOkResponse({ schema: { example: { login: 'login', name: 'name' } } })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // #endregion
  async register(@Body() registrationData: RegisterDto) {
    console.log(registrationData)
    return this.authService.register(registrationData);
  }
 
  @UseGuards(LoginGuard)
  @Post('login')// Обработает GET http://localhost/auth/login
  // #region
  @ApiOperation({ summary: "Login with login and password" })
  @ApiOkResponse({ schema: { example: { login: 'login', name: 'name' } } })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  // #endregion
  async logIn(@Req() req: RequestWithUser, @Res() res) {
    const user = req.user;
    const accessTokenCookie  = await this.authService.getCookieWithJwtToken(user.id);
    const { refreshTokenCookie, refreshToken } = await this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setRefreshToken(refreshToken, user.id)
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    user.password = 'undefined';
    return res.status(HttpStatus.OK).json(user);
  }

   @UseGuards(JwtAuthenticatedGuard)
   @Post('logout')// Обработает GET http://localhost/auth/logout
   // #region
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" }) 
  // #endregion
   async logout (@Req() req: RequestWithUser, @Res() res) {
    await this.userService.removeRefreshToken(req.user.id)
    res.setHeader('Set-Cookie', this.authService.getCookieForLogout());
    return res.sendStatus(200).json({ logout: true });
   }

}