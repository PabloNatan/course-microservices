import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

import * as moment from 'moment-timezone';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:curso@localhost:5672/smartranking'],
        queue: 'admin-backend',
        noAck: false,
      },
    },
  );

  Date.prototype.toJSON = function (): any {
    return moment.tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss.SSS');
  };

  await app.listen();
}
bootstrap();
