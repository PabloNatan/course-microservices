import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categoria } from './schemas/categoria.schema';
import { Model } from 'mongoose';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { JogadoresService } from 'src/jogadores/jogadores.service';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel(Categoria.name)
    private readonly categoriaModel: Model<Categoria>,
    private readonly jogadoresService: JogadoresService,
  ) {}

  async criarCategoria(
    criarCategoriaDto: CriarCategoriaDto,
  ): Promise<Categoria> {
    const { categoria } = criarCategoriaDto;

    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${categoria} já cadastrada`);
    }

    const categoriaCriada = new this.categoriaModel(criarCategoriaDto);
    return await categoriaCriada.save();
  }

  async atualizarCategoria(
    _id: string,
    atualizarCategoriaDto: AtualizarCategoriaDto,
  ): Promise<void> {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ _id })
      .exec();

    if (!categoriaEncontrada) {
      throw new BadRequestException(`Categoria com Id ${_id} não encontrada`);
    }

    await this.categoriaModel.updateOne({ _id }, atualizarCategoriaDto).exec();
  }

  async consultarCategorias(): Promise<Categoria[]> {
    return this.categoriaModel.find().populate('jogadores').exec();
  }

  async recuperarCategoriaPorCategoria(categoria: string) {
    const categoriaEncontrada = await this.categoriaModel.findOne({
      categoria,
    });
    if (!categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${categoria} não encontrada`);
    }
    return categoriaEncontrada;
  }

  async atribuirCategoriaJogador(params: string[]) {
    const categoria = params['categoria'];
    const idJogador = params['idJogador'];

    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (!categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${categoria} não cadastrada!`);
    }

    await this.jogadoresService.consultarJogadorPorId(idJogador);

    const jogadorJaCadastradoCategoria = await this.categoriaModel
      .find({ categoria })
      .where('jogadores')
      .in(idJogador)
      .exec();

    if (jogadorJaCadastradoCategoria.length > 0) {
      throw new BadRequestException(
        `Jogador ${idJogador} já cadastrado na Categoria ${categoria}`,
      );
    }
    categoriaEncontrada.jogadores.push(idJogador);

    await this.categoriaModel
      .findOneAndUpdate({ categoria }, categoriaEncontrada)
      .exec();
  }

  async recuperarCategoriaJogador(jogadorId: string) {
    return this.categoriaModel
      .findOne({ jogadores: { _id: jogadorId } })
      .exec();
  }
}
