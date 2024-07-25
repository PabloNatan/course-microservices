export interface RankingResponse {
  jogador?: string;
  posicao?: number;
  pontuacao?: number;
  historicoPartida?: Historico;
}

export interface Historico {
  vitorias?: number;
  derrotas?: number;
}

export interface ResultByPlayer {
  [key: string]: RankingResult;
}

export interface RankingResult {
  jogador: string;
  historico: { [key: string]: number };
  pontos: number;
}
