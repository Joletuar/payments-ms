import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Request } from 'express';

import { PaymentsService } from './payments.service';
import { PaymentsSessionDto } from './dtos/payments-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session') // Usa http
  @MessagePattern('create.payment.session') // Usa rabbitmq
  createPaymentSession(@Body() paymentsSessionDto: PaymentsSessionDto) {
    return this.paymentsService.createPaymentSession(paymentsSessionDto);
  }

  @Get('success')
  success() {
    return 'success ';
  }

  @Get('cancel')
  cancel() {
    return 'cancel';
  }

  @Post('webhook')
  async stripeWehook(@Req() req: Request) {
    await this.paymentsService.stripeWebhookHandler(req);
  }
}
