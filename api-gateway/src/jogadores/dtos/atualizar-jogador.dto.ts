import { IsOptional, IsString } from 'class-validator';

export class AtualizarJogadorDto {
  // @IsNotEmpty()
  // @IsString()
  // readonly telefoneCelular: string;

  // @IsNotEmpty()
  // @IsString()
  // readonly nome: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  urlFotoJogador?: string;
}
