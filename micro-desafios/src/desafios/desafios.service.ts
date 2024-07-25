import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartidaDocument } from 'src/partidas/schemas/partida.schema';
import { DesafioStatus } from './schemas/desafio-status.enum';
import { Desafio, DesafioDocument } from './schemas/desafios.schema';
import * as momentTimezone from 'moment-timezone';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
  ) {}

  private readonly logger = new Logger(DesafiosService.name);

  async criarDesafio(desafio: Desafio): Promise<Desafio> {
    try {
      const desafioCriado = new this.desafioModel(desafio);
      desafioCriado.dataHoraSolicitacao = new Date();

      desafioCriado.status = DesafioStatus.PENDENTE;
      this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
      return desafioCriado.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarTodosDesafios(): Promise<Desafio[]> {
    try {
      return await this.desafioModel.find().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafiosDeUmJogador(
    _id: string,
  ): Promise<Desafio[] | Desafio> {
    try {
      return await this.desafioModel.find().where('jogadores').in([_id]).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafioPeloId(_id: string): Promise<Desafio> {
    try {
      return await this.desafioModel
        .findOne({ _id })
        .populate('partida')
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafiosRealizados(idCategoria: string): Promise<Desafio[]> {
    try {
      return this.desafioModel
        .find()
        .where('categoria')
        .equals(idCategoria)
        .where('status')
        .equals(DesafioStatus.REALIZADO)
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafiosRealizadosPelaData(
    idCategoria: string,
    dataRef: string,
  ): Promise<Desafio[]> {
    try {
      const dataRefNew = `${dataRef} 23:59:59.999`;
      return this.desafioModel
        .find({
          dataHoraDesafio: {
            $lte: momentTimezone(dataRefNew)
              .tz('UTC')
              .set('hour', 23)
              .format('YYYY-MM-DD HH:mm:ss.SSS+00:00'),
          },
        })
        .where('categoria')
        .equals(idCategoria)
        .where('status')
        .equals(DesafioStatus.REALIZADO)

        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async atualizarDesafio(_id: string, desafio: Desafio): Promise<void> {
    try {
      desafio.dataHoraResposta = new Date();
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafio })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async atualizarDesafioPartida(
    partida: PartidaDocument,
    desafio: DesafioDocument,
  ): Promise<void> {
    try {
      desafio.status = DesafioStatus.REALIZADO;
      desafio.partida = partida;
      await this.desafioModel
        .findOneAndUpdate({ _id: desafio._id }, { $set: desafio })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async deletarDesafio(desafio: DesafioDocument): Promise<void> {
    try {
      const { _id } = desafio;
      desafio.status = DesafioStatus.CANCELADO;
      this.logger.log(`desafio: ${JSON.stringify(desafio)}`);
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafio })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
