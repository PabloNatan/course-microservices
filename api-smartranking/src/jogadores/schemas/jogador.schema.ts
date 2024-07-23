import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JogadorDocument = HydratedDocument<Jogador>;

@Schema({ collection: 'jogadores' })
export class Jogador {
  @Prop({ required: true })
  telefoneCelular: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  nome: string;

  @Prop()
  ranking: string;

  @Prop()
  posicaoRanking: number;

  @Prop()
  urlFotoJogador: string;
}

export const JogadroSchema = SchemaFactory.createForClass(Jogador);
