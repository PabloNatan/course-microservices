import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ collection: 'rankings', timestamps: true })
export class Ranking {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  desafio: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  jogador: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  partida: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  categoria: string;

  @Prop()
  evento: string;

  @Prop()
  operacao: string;

  @Prop()
  pontos: number;
}

export const RankingSchema = SchemaFactory.createForClass(Ranking);
