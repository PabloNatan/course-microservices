import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import { Evento } from '../schemas/categoria.schema';

export class AtualizarCategoriaDto {
  @IsString()
  @IsOptional()
  readonly descricao: string;

  @IsArray()
  @ArrayMinSize(1)
  eventos: Evento[];
}
