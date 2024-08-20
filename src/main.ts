import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {
  // Aplicación normal
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Esto debe ir antes del listen para que sea tomado en cuenta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Creamos el microservicio
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        queue: 'payments',
        urls: [envs.RABBITMQ_SERVER],
        noAck: false,
        queueOptions: {
          durable: true,
          autoDelete: false,
        },
      },
    },
    {
      inheritAppConfig: true, // Con este flag podemos compartir la info
    },
  );

  // Levantamos todos los microservicios
  await app.startAllMicroservices();

  /**
   * En aplicaciones híbridas no se comparte los global pipes,
   * interceptors, guards y filters que no estén basados en http
   */

  await app.listen(envs.PORT);

  const logger = new Logger('Payments MS');

  logger.log(`App is running on ${await app.getUrl()}`);
}

bootstrap();
