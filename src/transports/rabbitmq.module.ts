import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { ORDERS_SERVICE } from 'src/config/services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDERS_SERVICE,
        transport: Transport.RMQ,
        options: {
          queue: 'orders',
          urls: [envs.RABBITMQ_SERVER],
          noAck: true,
          queueOptions: {
            durable: true,
            autoDelete: false,
          },
        },
      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: ORDERS_SERVICE,
        transport: Transport.RMQ,
        options: {
          queue: 'orders',
          urls: [envs.RABBITMQ_SERVER],
          noAck: true,
          queueOptions: {
            durable: true,
            autoDelete: false,
          },
        },
      },
    ]),
  ],
})
export class RabbitMqModule {}
