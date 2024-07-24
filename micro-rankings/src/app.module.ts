import { Module } from '@nestjs/common';
import { RankingsModule } from './rankings/rankings.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProxyRmqModule } from './proxyrmq/proxyrmq.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:root_password@127.0.0.1:27017', {
      dbName: 'srranking',
      autoCreate: true,
    }),
    RankingsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ProxyRmqModule,
  ],
})
export class AppModule {}
