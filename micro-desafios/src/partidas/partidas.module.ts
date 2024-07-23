import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartidasController } from './partidas.controller';
import { PartidasService } from './partidas.service';
import { PartidaSchema } from './schemas/partida.schema';
import { ProxyRmqModule } from 'src/proxyrmq/proxyRMQ.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Partida', schema: PartidaSchema }]),
    ProxyRmqModule,
  ],
  controllers: [PartidasController],
  providers: [PartidasService],
})
export class PartidasModule {}
