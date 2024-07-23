import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { JogadoresService } from './jogadores.service';
import { Jogador, JogadorDocument } from './schemas/jogador.schema';

const ackErrors = ['E11000'];

@Controller()
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  private readonly logger = new Logger(JogadoresController.name);

  @EventPattern('criar-jogador')
  async criarJogador(@Payload() jogador: Jogador, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`jogador: ${JSON.stringify(jogador)}`);

    try {
      await this.jogadoresService.criarJogador(jogador);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`CriarJogador error: ${JSON.stringify(error.message)}`);
      const ackError = ackErrors.find((ackError) =>
        error?.message.includes(ackError),
      );
      if (ackError) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('atualizar-jogador')
  async atualizarJogador(
    @Payload() jogador: JogadorDocument,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`atualizarJogador: ${JSON.stringify(jogador)}`);

    try {
      await this.jogadoresService.atualizarJogador(jogador);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `AtualizarJogador error: ${JSON.stringify(error.message)}`,
      );
      const ackError = ackErrors.find((ackError) =>
        error?.message.includes(ackError),
      );
      if (ackError) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('consultar-jogadores')
  async recuperarJogadores(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      return this.jogadoresService.consultarTodosJogadores();
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @MessagePattern('consultar-jogador')
  async consultarJogadorPorId(
    @Payload() _id: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      return this.jogadoresService.consultarJogadorPorId(_id);
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('deletar-jogador')
  async deletarJogadorPorId(
    @Payload() _id: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.jogadoresService.deletarJogador(_id);
    } catch (error) {
      const ackError = ackErrors.find((ackError) =>
        error.message.includes(ackError),
      );

      if (ackError || error instanceof RpcException) {
        await channel.ack(originalMsg);
      }
    }
  }
}
