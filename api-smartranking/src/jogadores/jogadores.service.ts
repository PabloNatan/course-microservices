import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador, JogadorDocument } from './schemas/jogador.schema';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectModel(Jogador.name) private readonly jogadorModel: Model<Jogador>,
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarJogador(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
    const { email } = criarJogadorDto;

    const jogadorEncontrado = await this.jogadorModel.findOne({ email }).exec();
    if (jogadorEncontrado) {
      throw new BadRequestException(
        `Jogador com e-mail ${email} já cadastrado`,
      );
    }

    let jogadorCriado = new this.jogadorModel(criarJogadorDto);
    jogadorCriado = await jogadorCriado.save();
    this.logger.log(
      `CriarJogadorDto: ${JSON.stringify(jogadorCriado, null, 2)}`,
    );
    return jogadorCriado;
  }

  async atualizarJogador(
    _id: string,
    atualizarJogadorDto: AtualizarJogadorDto,
  ): Promise<void> {
    const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec();

    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com o id ${_id} não encontrado`);
    }

    await this.jogadorModel
      .findOneAndUpdate({ _id }, atualizarJogadorDto)
      .exec();
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    return await this.jogadorModel.find().exec();
  }

  async consultarJogadorPorId(_id: string): Promise<JogadorDocument> {
    const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec();
    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com Id: ${_id} não encontrado`);
    }
    return jogadorEncontrado;
  }

  async deletarJogador(_id: string): Promise<void> {
    const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec();
    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com Id: ${_id} não encontrado`);
    }
    await this.jogadorModel.deleteOne({ _id }).exec();
  }
}
