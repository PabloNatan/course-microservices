import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DesafiosService } from './desafios.service';
import { Desafio, DesafioDocument } from './schemas/desafios.schema';
import { PartidaDocument } from 'src/partidas/schemas/partida.schema';

const ackErrors: string[] = ['E11000'];

@Controller()
export class DesafiosController {
  constructor(private readonly desafiosService: DesafiosService) {}

  private readonly logger = new Logger(DesafiosController.name);

  @EventPattern('criar-desafio')
  async criarDesafio(@Payload() desafio: Desafio, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`desafio: ${JSON.stringify(desafio)}`);
      await this.desafiosService.criarDesafio(desafio);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`);
      const filterAckError = ackErrors.find((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('consultar-desafios')
  async consultarDesafios(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<Desafio[] | Desafio> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const { idJogador, _id } = data;
      this.logger.log(`data: ${JSON.stringify(data)}`);
      if (idJogador) {
        return await this.desafiosService.consultarDesafiosDeUmJogador(
          idJogador,
        );
      } else if (_id) {
        return await this.desafiosService.consultarDesafioPeloId(_id);
      } else {
        return await this.desafiosService.consultarTodosDesafios();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-desafio')
  async atualizarDesafio(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`data: ${JSON.stringify(data)}`);
      const _id: string = data.id;
      const desafio: Desafio = data.desafio;
      await this.desafiosService.atualizarDesafio(_id, desafio);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('atualizar-desafio-partida')
  async atualizarDesafioPartida(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`idPartida: ${data}`);
      const idPartida: PartidaDocument = data.idPartida;
      const desafio: DesafioDocument = data.desafio;
      await this.desafiosService.atualizarDesafioPartida(idPartida, desafio);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('deletar-desafio')
  async deletarDesafio(
    @Payload() desafio: DesafioDocument,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.desafiosService.deletarDesafio(desafio);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`);
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }
}
