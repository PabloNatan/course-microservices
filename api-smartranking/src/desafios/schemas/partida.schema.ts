import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Jogador } from 'src/jogadores/schemas/jogador.schema';

export interface Resultado {
  set: string;
}

@Schema({ collection: 'partidas', timestamps: true })
export class Partida {
  @Prop()
  categoria: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' }] })
  jogadores: Jogador[];

  @Prop([
    raw({
      set: { type: String },
    }),
  ])
  resultado: Resultado[];
}

export const PartidaSchema = SchemaFactory.createForClass(Partida);
