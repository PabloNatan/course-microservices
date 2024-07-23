import { IsDateString, IsOptional, IsString } from 'class-validator';
import { DesafioStatus } from '../schemas/desafio-status.enum';

export class AtualizarDesafioDto {
  @IsOptional()
  @IsDateString()
  dataHoraDesafio: Date;

  @IsOptional()
  @IsString()
  status: DesafioStatus;
}
