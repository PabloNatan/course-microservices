import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class AtualizarCategoriaDto {
  @IsString()
  @IsOptional()
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
