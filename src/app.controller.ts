import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginGuard } from './auth/guards/login.guard';
import { LoginDTO } from './auth/dto/login.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiExcludeEndpoint()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
 