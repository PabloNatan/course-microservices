export interface Partida {
  categoria: string;
  desafio: string;
  jogadores: string[];
  resultado: Array<Resultado>;
  def: string;
}

export interface Resultado {
  set: string;
}
