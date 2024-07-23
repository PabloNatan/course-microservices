import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

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

  await app.listen();
}
bootstrap();
