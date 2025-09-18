import { Body, Req, Controller, HttpCode, Post, UseGuards, ValidationPipe, Res, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import RequestWithUser from './requestWithUser.interface';
import RegisterDto from './dto/register.dto';
import { LoginGuard } from './guards/login.guard';
import JwtAuthenticatedGuard from './guards/jwt-authenticated.guard';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { UserService } from 'src/user/user.service';
 
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

   @UseGuards(JwtAuthenticatedGuard)
   @Get()
   checkAuthentication(@Req() req: RequestWithUser) {
    const user = req.user;
    user.password = 'undefined';
    return user;
   }

  @UseGuards(JwtRefreshGuard) 
  @Get('refresh') 
  async refresh (@Req() req: RequestWithUser) {
    const jwtToken = await this.authService.getCookieWithJwtToken(req.user.id);
    req.res.setHeader('Set-Cookie', jwtToken);
    return req.user;
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    console.log(registrationData)
    return this.authService.register(registrationData);
  }
 
  @UseGuards(LoginGuard)
  @Post('login')
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
   @Post('logout')
   async logout (@Req() req: RequestWithUser, @Res() res) {
    await this.userService.removeRefreshToken(req.user.id)
    res.setHeader('Set-Cookie', this.authService.getCookieForLogout());
    return res.sendStatus(200).json({ logout: true });
   }

}