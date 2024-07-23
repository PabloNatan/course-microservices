import { Controller, Logger } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { Categoria } from './schemas/categoria.schema';
import { AtribuirCategoriaJogadorParams } from './interface/atribuir-categoria-jogador-dto';

const ackErrors = ['E11000'];

@Controller()
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  private readonly logger = new Logger(CategoriasController.name);

  @EventPattern('criar-categoria')
  async criarCategoria(
    @Payload() categoria: Categoria,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`categoria: ${JSON.stringify(categoria)}`);

    try {
      await this.categoriasService.criarCategoria(categoria);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `CriarCategoriaController error: ${JSON.stringify(error.message)}`,
      );
      ackErrors.map(async (ackError) => {
        if (error?.message.includes(ackError)) {
          await channel.ack(originalMsg);
        }
      });
    }
  }

  @MessagePattern('consultar-categorias')
  async consultarCategorias(
    @Payload() _id: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      if (_id) {
        return this.categoriasService.recuperarCategoriaPorId(_id);
      } else {
        return this.categoriasService.consultarCategorias();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-categoria')
  async atualizarCategoria(
    @Payload() data: { id: string; categoria: Categoria },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`data: ${JSON.stringify(data)}`);
    try {
      const _id: string = data.id;
      const categoria: Categoria = data.categoria;
      await this.categoriasService.atualizarCategoria(_id, categoria);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`atualizarCategoria: ${error.message}`);
      const ackError = ackErrors.find((ackError) =>
        error.message.includes(ackError),
      );

      if (ackError) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('atribuir-categoria-jogador')
  async atribuirCategoriaJogador(
    @Payload() data: AtribuirCategoriaJogadorParams,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`AtribuirCategoriaJogador data: ${JSON.stringify(data)}`);
    try {
      await this.categoriasService.atribuirCategoriaJogador(data);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error('AtribuirCategoriaJogador', error);
      const ackError = ackErrors.find((ackError) =>
        error.message.includes(ackError),
      );

      if (ackError || error instanceof RpcException) {
        await channel.ack(originalMsg);
      }
    }
  }
}
