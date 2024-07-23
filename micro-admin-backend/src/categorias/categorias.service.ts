import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtribuirCategoriaJogadorParams } from './interface/atribuir-categoria-jogador-dto';
import { Categoria } from './schemas/categoria.schema';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel(Categoria.name)
    private readonly categoriaModel: Model<Categoria>,
    private readonly jogadoresService: JogadoresService,
  ) {}

  private readonly logger = new Logger(CategoriasService.name);

  async criarCategoria(categoria: Categoria): Promise<void> {
    try {
      const categoriaCriada = new this.categoriaModel(categoria);
      await categoriaCriada.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async recuperarCategoriaPorId(_id: string) {
    const categoriaEncontrada = await this.categoriaModel.findOne({
      _id,
    });
    if (!categoriaEncontrada) {
      throw new RpcException(`Categoria com Id ${_id} não encontrada`);
    }
    return categoriaEncontrada;
  }

  async recuperarCategoriaPorCategoria(categoria: string) {
    const categoriaEncontrada = await this.categoriaModel.findOne({
      categoria,
    });
    if (!categoriaEncontrada) {
      throw new RpcException(`Categoria ${categoria} não encontrada`);
    }
    return categoriaEncontrada;
  }

  async consultarCategorias(): Promise<Categoria[]> {
    return this.categoriaModel.find().populate('jogadores').exec();
  }

  async atualizarCategoria(_id: string, categoria: Categoria): Promise<void> {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ _id })
      .exec();

    if (!categoriaEncontrada) {
      throw new RpcException(`Categoria com Id ${_id} não encontrada`);
    }

    await this.categoriaModel.updateOne({ _id }, categoria).exec();
  }

  async atribuirCategoriaJogador(params: AtribuirCategoriaJogadorParams) {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ _id: params._id })
      .exec();

    if (!categoriaEncontrada) {
      throw new RpcException(`Categoria ${params._id} não cadastrada!`);
    }

    const jogadorEncontrado = await this.jogadoresService.consultarJogadorPorId(
      params.jogadorId,
    );

    if (jogadorEncontrado?.categoria?._id.toString() === params._id) {
      return;
    }

    if (jogadorEncontrado?.categoria) {
      throw new RpcException(
        `Jogador ${params.jogadorId} já cadastrado na Categoria ${params._id}`,
      );
    }
    jogadorEncontrado.categoria = categoriaEncontrada;
    categoriaEncontrada.jogadores.push(jogadorEncontrado);

    await this.jogadoresService.atualizarJogador(jogadorEncontrado);
    await this.categoriaModel.findOneAndUpdate({}, categoriaEncontrada).exec();
  }
}
