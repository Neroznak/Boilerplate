import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Body, Post } from '@nestjs/common';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('error')
  // throwError() {
  //   throw new Error('Test error');
  // }



}