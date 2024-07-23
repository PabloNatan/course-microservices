import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { JogadorDocument } from 'src/jogadores/schemas/jogador.schema';
import { DesafioStatus } from './desafio-status.enum';
import { Partida } from './partida.schema';

export type DesafioDocument = HydratedDocument<Desafio>;

@Schema({ collection: 'desafios', timestamps: true })
export class Desafio {
  @Prop({ required: true })
  dataHoraDesafio: Date;

  @Prop({ type: String, enum: DesafioStatus, default: DesafioStatus.PENDENTE })
  status: DesafioStatus;

  @Prop()
  dataHoraSolicitacao: Date;

  @Prop()
  dataHoraResposta: Date;

  @Prop()
  categoria: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' })
  solicitante: JogadorDocument;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' }] })
  jogadores: JogadorDocument[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Partida' })
  partida: Partida;
}

export const DesafioSchema = SchemaFactory.createForClass(Desafio);
