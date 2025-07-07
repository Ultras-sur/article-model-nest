import { Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { UserService } from '../user/user.service';
const bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(userData: LoginDTO) {
    console.log(2)
    const { login, password } = userData;
    const user = await this.userService.findUserByLogin(login);
    console.log(user)
    if (user && (await bcrypt.compare(password, user.password.toString()))) {
      return this.userService.sanitizeUser(user);
    }
    return null;
  }
}