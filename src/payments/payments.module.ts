import { Module } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RabbitMqModule } from 'src/transports/rabbitmq.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [RabbitMqModule],
})
export class PaymentsModule {}
