import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Jogador } from 'src/jogadores/schemas/jogador.schema';

export type CategoriaDocument = HydratedDocument<Categoria>;

export interface Evento {
  nome: string;
  operacao: string;
  valor: number;
}

@Schema({ collection: 'categorias', timestamps: true })
export class Categoria {
  @Prop({ required: true, unique: true })
  categoria: string;

  @Prop()
  descricao: string;

  @Prop([
    raw({
      nome: { type: String },
      operacao: { type: String },
      valor: { type: Number },
    }),
  ])
  eventos: Evento[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' }] })
  jogadores: Jogador[];
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
