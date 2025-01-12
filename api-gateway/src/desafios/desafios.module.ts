import { Module } from '@nestjs/common';
import { DesafiosController } from './desafios.controller';
import { ProxyRMQModule } from 'src/proxyrmq/proxyRMQ.module';

@Module({
  controllers: [DesafiosController],
  imports: [ProxyRMQModule],
})
export class DesafiosModule {}
