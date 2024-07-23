import { BadRequestException, PipeTransform } from '@nestjs/common';
import { DesafioStatus } from '../interfaces/desafio-status.enum';

export class DesafioStatusValidacaoPipe implements PipeTransform {
  readonly statusPermitidos = [
    DesafioStatus.ACEITO,
    DesafioStatus.NEGADO,
    DesafioStatus.CANCELADO,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();
    if (!this.ehStatusValido(status)) {
      throw new BadRequestException(`${status} é um status inválido`);
    }
    return value;
  }

  private ehStatusValido(status: string) {
    return this.statusPermitidos.includes(status as DesafioStatus);
  }
}
