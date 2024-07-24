import { Injectable, Logger } from '@nestjs/common';
import { Partida } from './schemas/partida.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Ranking } from './schemas/ranking.schema';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { Categoria } from './schemas/categoria.interface';
import { lastValueFrom } from 'rxjs';
import { EventoNome } from './evento-nome.enum';

@Injectable()
export class RankingsService {
  constructor(
    @InjectModel(Ranking.name) private readonly desafioModel: Model<Ranking>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(RankingsService.name);

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async processarPartida(idPartida: string, partida: Partida): Promise<void> {
    try {
      const categoria: Categoria = await lastValueFrom(
        this.clientAdminBackend.send('consultar-categorias', partida.categoria),
      );

      await Promise.all(
        partida.jogadores.map(async (jogador) => {
          const ranking = new this.desafioModel();

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
}
