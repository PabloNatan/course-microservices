import { Module } from '@nestjs/common';
import { DesafiosController } from './desafios.controller';
import { DesafiosService } from './desafios.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Desafio, DesafioSchema } from './schemas/desafios.schema';
import { JogadoresModule } from 'src/jogadores/jogadores.module';
import { CategoriasModule } from 'src/categorias/categorias.module';
import { Partida, PartidaSchema } from './schemas/partida.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Desafio.name, schema: DesafioSchema }]),
    MongooseModule.forFeature([{ name: Partida.name, schema: PartidaSchema }]),
    JogadoresModule,
    CategoriasModule,
  ],
  controllers: [DesafiosController],
  providers: [DesafiosService],
})
export class DesafiosModule {}
