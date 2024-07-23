import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { JogadorDocument } from 'src/jogadores/schemas/jogador.schema';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { DesafioStatus } from './schemas/desafio-status.enum';
import { Desafio } from './schemas/desafios.schema';
import { Partida } from './schemas/partida.schema';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel(Desafio.name) private readonly desafioModel: Model<Desafio>,
    @InjectModel(Partida.name) private readonly partidaModel: Model<Partida>,
    private readonly jogadoresService: JogadoresService,
    private readonly categoriasService: CategoriasService,
  ) {}

  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
    let solicitante: JogadorDocument;
    const verificarJogadoresPromises = criarDesafioDto.jogadores.map(
      async (jogador) => {
        const jogadorEncontrado =
          await this.jogadoresService.consultarJogadorPorId(
            jogador._id.toString(),
          );

        if (!jogadorEncontrado) {
          throw new BadRequestException(
            `Jogador com Id ${jogador._id} não encontrado`,
          );
        }

        if (
          jogadorEncontrado._id.toString() ===
          criarDesafioDto.solicitante._id.toString()
        ) {
          solicitante = jogadorEncontrado;
        }
      },
    );
    await Promise.all(verificarJogadoresPromises);

    if (!solicitante) {
      throw new BadRequestException(`Solicitante deve ser um jogador valido`);
    }

    const desafioEncontrado = await this.desafioModel
      .findOne({
        solicitante: criarDesafioDto.solicitante,
        dataHoraDesafio: criarDesafioDto.dataHoraDesafio,
      })
      .exec();

    if (desafioEncontrado) {
      throw new BadRequestException(
        `Desafio com do solicitante ${criarDesafioDto.solicitante._id} já criado`,
      );
    }

    const categoriaSolicitante =
      await this.categoriasService.recuperarCategoriaJogador(
        solicitante._id.toString(),
      );

    if (!categoriaSolicitante) {
      throw new BadRequestException(
        `O Solicitante precisa estar registrado em uma categoria`,
      );
    }

    const desafioCriado = new this.desafioModel(criarDesafioDto);
    desafioCriado.categoria = categoriaSolicitante.categoria;
    desafioCriado.dataHoraSolicitacao = new Date();
    desafioCriado.status = DesafioStatus.PENDENTE;

    return desafioCriado.save();
  }

  async consultarTodosDesafios(): Promise<Desafio[]> {
    return await this.desafioModel.find().exec();
  }

  async consultarDesafiosDeUmJogador(idJogador: string): Promise<Desafio[]> {
    const desafioEncontrado = await this.desafioModel
      .find()
      .where('jogadores')
      .in([idJogador])
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec();
    if (desafioEncontrado.length === 0) {
      throw new BadRequestException(
        `Desafio para o Id ${idJogador} não encontrado`,
      );
    }
    return desafioEncontrado;
  }

  async atualizarDesafio(
    _id: string,
    atualizarDesafioDto: AtualizarDesafioDto,
  ): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id).exec();

    if (!desafioEncontrado) {
      throw new NotFoundException(`Desafio ${_id} não encontrado!`);
    }

    if (atualizarDesafioDto.status) {
      desafioEncontrado.dataHoraResposta = new Date();
      desafioEncontrado.status = atualizarDesafioDto.status;
    }

    desafioEncontrado.dataHoraDesafio = atualizarDesafioDto.dataHoraDesafio;

    await this.desafioModel
      .findOneAndUpdate({ _id }, { $set: desafioEncontrado })
      .exec();
  }

  async atribuirDesafioPartida(
    _id: string,
    atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
  ): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id).exec();

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não encotrado!`);
    }

    const jogadorFazParteDoDesafio = desafioEncontrado.jogadores.some(
      (jogador) =>
        jogador._id.toString() === String(atribuirDesafioPartidaDto.def),
    );

    if (!jogadorFazParteDoDesafio) {
      throw new BadRequestException(
        `O jogador vencedor não faz parte do desafio!`,
      );
    }

    const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto);

    partidaCriada.categoria = desafioEncontrado.categoria;
    partidaCriada.jogadores = desafioEncontrado.jogadores;
    const resultado = await partidaCriada.save();

    desafioEncontrado.status = DesafioStatus.REALIZADO;
    desafioEncontrado.partida = resultado;

    try {
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafioEncontrado })
        .exec();
    } catch (error) {
      await this.partidaModel.deleteOne({ _id: resultado._id }).exec();
      throw new InternalServerErrorException();
    }
  }

  async deletarDesafio(_id: string): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id).exec();

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`);
    }

    desafioEncontrado.status = DesafioStatus.CANCELADO;
    await this.desafioModel
      .findOneAndUpdate({ _id }, { $set: desafioEncontrado })
      .exec();
  }
}
