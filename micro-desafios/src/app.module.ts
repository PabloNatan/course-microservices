import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DesafiosModule } from './desafios/desafios.module';
import { PartidasModule } from './partidas/partidas.module';
import { ProxyRmqModule } from './proxyrmq/proxyRMQ.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:root_password@127.0.0.1:27017', {
      dbName: 'srdesafios',
      autoCreate: true,
    }),
    DesafiosModule,
    PartidasModule,
    ProxyRmqModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
