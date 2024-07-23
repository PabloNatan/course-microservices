import { Module } from '@nestjs/common';
import { JogadoresController } from './jogadores.controller';
import { JogadoresService } from './jogadores.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Jogador, JogadroSchema } from './schemas/jogador.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Jogador.name, schema: JogadroSchema }]),
  ],
  controllers: [JogadoresController],
  providers: [JogadoresService],
  exports: [JogadoresService],
})
export class JogadoresModule {}
