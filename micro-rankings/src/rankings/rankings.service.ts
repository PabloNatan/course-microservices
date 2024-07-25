import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import * as momentTimezone from 'moment-timezone';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { EventoNome } from './evento-nome.enum';
import { Categoria } from './schemas/categoria.interface';
import { Desafio } from './schemas/desagio.interface';
import { Partida } from './schemas/partida.interface';
import {
  RankingResponse,
  RankingResult,
  ResultByPlayer,
} from './schemas/ranking-response.interface';
import { Ranking } from './schemas/ranking.schema';

@Injectable()
export class RankingsService {
  constructor(
    @InjectModel(Ranking.name) private readonly rankingModel: Model<Ranking>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(RankingsService.name);

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  private clientDesafios =
    this.clientProxySmartRanking.getClientProxyDesafiosInstance();

  async processarPartida(idPartida: string, partida: Partida): Promise<void> {
    try {
      const categoria: Categoria = await lastValueFrom(
        this.clientAdminBackend.send('consultar-categorias', partida.categoria),
      );

      await Promise.all(
        partida.jogadores.map(async (jogador) => {
          const ranking = new this.rankingModel();

          ranking.categoria = partida.categoria;
          ranking.desafio = partida.desafio;
          ranking.partida = idPartida;
          ranking.jogador = jogador;

          if (jogador === partida.def) {
            const evento = categoria.eventos.find(
              (ev) => ev.nome === EventoNome.VITORIA,
            );
            ranking.evento = EventoNome.VITORIA;
            ranking.operacao = evento?.operacao;
            ranking.pontos = evento?.valor;
          } else {
            const evento = categoria.eventos.find(
              (ev) => ev.nome === EventoNome.DERROTA,
            );
            ranking.evento = EventoNome.DERROTA;
            ranking.operacao = evento?.operacao;
            ranking.pontos = evento?.valor;
          }

          this.logger.log(`ranking: ${JSON.stringify(ranking, null, 2)}`);

          await ranking.save();
        }),
      );
    } catch (error) {
      this.logger.error(`error: ${error}`);
      throw new RpcException(error?.message);
    }
  }

  async consultarRankings(
    idCategoria: string,
    dataRef: string,
  ): Promise<RankingResponse | RankingResponse[]> {
    try {
      this.logger.log(`idCategoria: ${idCategoria} dataRef: ${dataRef}`);

      if (!dataRef) {
        dataRef = momentTimezone().tz('America/Sao_Paulo').format('YYYY-MM-DD');
      }

      const registrosRanking = await this.rankingModel
        .find()
        .where('categoria')
        .equals(idCategoria)
        .exec();

      const desafios: Desafio[] = await lastValueFrom(
        this.clientDesafios.send('consultar-desafios-realizados', {
          idCategoria,
          dataRef,
        }),
      );

      const registrosRankingsFiltered = registrosRanking.filter((registro) =>
        desafios.find(
          (desafio) => String(desafio._id) === String(registro.desafio),
        ),
      );

      const rankingsPorJogador: RankingResult[] = Object.values(
        registrosRankingsFiltered.reduce(
          (prev, { jogador, pontos, evento }) => {
            const key = String(jogador);
            if (!prev[key]) {
              prev[key] = {
                jogador: key,
                historico: {},
                pontos: 0,
              };
            }

            const eventoCount = prev[key].historico?.[evento];
            prev[key].historico[evento] = eventoCount ? eventoCount + 1 : 1;
            prev[key].pontos += pontos;
            return prev;
          },
          {} as ResultByPlayer,
        ),
      ).sort((jogadorA, jogadorB) => jogadorB.pontos - jogadorA.pontos);

      const rankingResponseList = rankingsPorJogador.map(
        (jogadorRanking, index) => {
          const rankingResponse: RankingResponse = {};
          rankingResponse.jogador = jogadorRanking.jogador;
          rankingResponse.posicao = index + 1;
          rankingResponse.pontuacao = jogadorRanking.pontos;
          rankingResponse.historicoPartida = {
            derrotas: jogadorRanking.historico['DERROTA'] ?? 0,
            vitorias: jogadorRanking.historico['VITORIA'] ?? 0,
          };

          return rankingResponse;
        },
      );
      return rankingResponseList;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error);
    }
  }
}
