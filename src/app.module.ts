import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { PaymentsModule } from './payments/payments.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  messageKey: 'message',
                  colorize: true,
                },
              }
            : undefined,
        messageKey: 'message',
      },
    }),
    PaymentsModule,
    HealthCheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
