import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('/')
export class HealthCheckController {
  @Get()
  @HttpCode(200)
  getHealthCheckStatus() {
    return 'Payments MS is running OK';
  }
}
