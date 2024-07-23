import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Partida } from 'src/partidas/schemas/partida.schema';
import { DesafioStatus } from './desafio-status.enum';

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

  @Prop({ type: mongoose.Schema.Types.ObjectId /* ref: 'Jogador'*/ })
  solicitante: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId /* ref: 'Jogador'*/ }],
  })
  jogadores: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Partida' })
  partida: Partida;
}

export const DesafioSchema = SchemaFactory.createForClass(Desafio);
