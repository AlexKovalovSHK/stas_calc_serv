import { Controller, Get } from '@nestjs/common';

@Controller('/health')
export class AppController {
  
  @Get('')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'IFOB SCOOL'
    };
  }
}