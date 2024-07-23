import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CriarCategoriaDto {
  @IsString()
  @IsNotEmpty()
  readonly categoria: string;

  @IsString()
  @IsNotEmpty()
  readonly descricao: string;

  @IsArray()
  @ArrayMinSize(1)
  eventos: Evento[];
}

interface Evento {
  nome: string;
  operacao: string;
  valor: number;
}
