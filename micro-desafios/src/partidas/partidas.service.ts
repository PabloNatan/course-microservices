import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Partida } from './schemas/partida.schema';
import { ClientProxySmartRanking } from 'src/proxyrmq/clinet-proxy';
import { Desafio } from 'src/desafios/schemas/desafios.schema';
import { RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PartidasService {
  constructor(
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(PartidasService.name);

  private clientDesafios =
    this.clientProxySmartRanking.getClientProxyDesafiosInstance();

  private clientRankings =
    this.clientProxySmartRanking.getClientProxyRankingsInstance();

  async criarPartida(partida: Partida): Promise<void> {
    try {
      const partidaCriada = new this.partidaModel(partida);
      this.logger.log(`partidaCriada: ${JSON.stringify(partidaCriada)}`);

      const result = await partidaCriada.save();
      this.logger.log(`result: ${JSON.stringify(result)}`);

      const desafio: Desafio = await lastValueFrom(
        this.clientDesafios.send('consultar-desafios', {
          idJogador: '',
          _id: partida.desafio,
        }),
      );

      this.clientDesafios.emit('atualizar-desafio-partida', {
        idPartida: result,
        desafio: desafio,
      });

      this.clientRankings.emit('processar-partida', {
        idPartida: result,
        partida,
      });
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
