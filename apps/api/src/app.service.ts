import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '2+2=4-3=1= ДИМА НЕРОЗНАК';
  }
}
