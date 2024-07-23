import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Jogador, JogadorDocument } from './schemas/jogador.schema';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectModel(Jogador.name) private readonly jogadorModel: Model<Jogador>,
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarJogador(jogador: Jogador): Promise<Jogador> {
    const { email } = jogador;

    const jogadorEncontrado = await this.jogadorModel.findOne({ email }).exec();
    if (jogadorEncontrado) {
      throw new RpcException(`Jogador com e-mail ${email} já cadastrado`);
    }

    let jogadorCriado = new this.jogadorModel(jogador);
    jogadorCriado = await jogadorCriado.save();
    this.logger.log(`Jogador: ${JSON.stringify(jogadorCriado, null, 2)}`);
    return jogadorCriado;
  }

  async atualizarJogador(jogador: JogadorDocument): Promise<void> {
    const jogadorEncontrado = await this.jogadorModel
      .findOne({ _id: jogador._id })
      .exec();

    if (!jogadorEncontrado) {
      throw new RpcException(`Jogador com o id ${jogador._id} não encontrado`);
    }

    await this.jogadorModel
      .findOneAndUpdate({ _id: jogador._id }, jogador)
      .exec();
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    return await this.jogadorModel.find().exec();
  }

  async consultarJogadorPorId(_id: string): Promise<JogadorDocument> {
    const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec();
    if (!jogadorEncontrado) {
      throw new RpcException(`Jogador com Id: ${_id} não encontrado`);
    }
    return jogadorEncontrado;
  }

  async deletarJogador(_id: string): Promise<void> {
    const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec();
    if (!jogadorEncontrado) {
      this.logger.error(`Error deletarJogador: Jogador não encontrado ${_id}`);
      throw new RpcException(`Jogador com Id: ${_id} não encontrado`);
    }
    await this.jogadorModel.deleteOne({ _id }).exec();
  }
}
