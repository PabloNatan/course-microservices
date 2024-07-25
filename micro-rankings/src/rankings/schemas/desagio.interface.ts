export interface Desafio {
  _id: string;
  dataHoraDesafio: Date;
  status: DesafioStatus;
  dataHoraSolicitacao: Date;
  dataHoraResposta?: Date;
  solicitante: string;
  categoria: string;
  partida?: string;
  jogadores: string[];
}

export enum DesafioStatus {
  REALIZADO = 'REALIZADO',
  PENDENTE = 'PENDENTE',
  ACEITO = 'ACEITO',
  NEGADO = 'NEGADO',
  CANCELADO = 'CANCELADO',
}
