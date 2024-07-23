import { IsString } from 'class-validator';

export class AtribuirCategoriaJogadorDto {
  @IsString()
  readonly _id: string;

  @IsString()
  readonly jogadorId: string;
}
