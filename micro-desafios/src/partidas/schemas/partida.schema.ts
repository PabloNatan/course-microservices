import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DesafioDocument } from 'src/desafios/schemas/desafios.schema';

export interface Resultado {
  set: string;
}

export type PartidaDocument = HydratedDocument<Partida>;

@Schema({ collection: 'partidas', timestamps: true })
export class Partida {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }] })
  desafio: DesafioDocument;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }] })
  def: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }] })
  categoria: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId /*ref: 'Jogador'*/ }] })
  jogadores: string[];

  @Prop([
    raw({
      set: { type: String },
    }),
  ])
  resultado: Resultado[];
}

export const PartidaSchema = SchemaFactory.createForClass(Partida);
