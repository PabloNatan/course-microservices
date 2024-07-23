import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CategoriaDocument } from 'src/categorias/schemas/categoria.schema';

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' })
  categoria: CategoriaDocument;
}

export const JogadorSchema = SchemaFactory.createForClass(Jogador);
