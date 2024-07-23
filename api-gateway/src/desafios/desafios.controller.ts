import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { lastValueFrom } from 'rxjs';
import { Jogador } from 'src/jogadores/interfaces/jogador.interface';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { DesafioStatusValidacaoPipe } from './pipes/desafio-status-validation.pipe';
import { Desafio } from './interfaces/desafio.interface';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { Partida } from './interfaces/partida.interface';

@Controller('api/v1/desafios')
export class DesafiosController {
  constructor(
    private readonly clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private logger = new Logger(DesafiosController.name);

  private clientDesafios =
    this.clientProxySmartRanking.getClientPRoxyDesafiosInstace();

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post()
  @UsePipes(ValidationPipe)
  async criarDesafio(@Body() criarDesafioDto: CriarDesafioDto) {
    this.logger.log(`criarDesafioDto: ${JSON.stringify(criarDesafioDto)}`);

    const solicitanteEhJogador = criarDesafioDto.jogadores.find(
      (jogador) => jogador._id === criarDesafioDto.solicitante._id,
    );

    if (!solicitanteEhJogador) {
      throw new BadRequestException(`Solicitante deve ser um jogador`);
    }

    const categoria = await lastValueFrom(
      this.clientAdminBackend.send(
        'consultar-categorias',
        criarDesafioDto.categoria,
      ),
    );

    if (!categoria) {
      throw new BadRequestException(
        `Categoria com Id: ${criarDesafioDto.categoria} não encontrada!`,
      );
    }

    const jogadoresPromises = criarDesafioDto.jogadores.map(async (jogador) => {
      const jogadorEncontrado: Jogador = await lastValueFrom(
        this.clientAdminBackend.send('consultar-jogador', jogador._id),
      );
      if (!jogadorEncontrado) {
        throw new BadRequestException(
          `Jogador com Id: ${jogador._id} não encontrado`,
        );
      }
      if (jogadorEncontrado.categoria !== categoria._id) {
        throw new BadRequestException(
          `O jogador ${jogador._id} não faz parte da categoria informada!`,
        );
      }
    });
    await Promise.all(jogadoresPromises);

    this.clientDesafios.emit('criar-desafio', criarDesafioDto);
  }

  @Get()
  async consultarDesafios(@Query('idJogador') idJogador: string): Promise<any> {
    if (idJogador) {
      const jogador: Jogador = await lastValueFrom(
        this.clientAdminBackend.send('consultar-jogadores', idJogador),
      );
      this.logger.log(`jogador: ${JSON.stringify(jogador)}`);
      if (!jogador) {
        throw new BadRequestException(`Jogador não cadastrado!`);
      }
    }
    return lastValueFrom(
      this.clientDesafios.send('consultar-desafios', {
        idJogador: idJogador,
        _id: '',
      }),
    );
  }

  @Get('/:_id')
  async recuperarDesafio(@Param() _id: string) {
    return lastValueFrom(
      this.clientDesafios.send('consultar-desafios', {
        idJogador: '',
        _id,
      }),
    );
  }

  @Put('/:desafio')
  async atualizarDesafio(
    @Body(DesafioStatusValidacaoPipe) atualizarDesafioDto: AtualizarDesafioDto,
    @Param('desafio') _id: string,
  ) {
    const desafio: Desafio = await lastValueFrom(
      this.clientDesafios.send('consultar-desafios', {
        idJogador: '',
        _id: _id,
      }),
    );

    this.logger.log(`desafio: ${JSON.stringify(desafio)}`);

    if (!desafio) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    if (desafio.status != DesafioStatus.PENDENTE) {
      throw new BadRequestException(
        'Somente desafios com status PENDENTE podem ser atualizados!',
      );
    }

    this.clientDesafios.emit('atualizar-desafio', {
      id: _id,
      desafio: atualizarDesafioDto,
    });
  }

  @Post('/:desafio/partida/')
  async atribuirDesafioPartida(
    @Body(ValidationPipe) atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
    @Param('desafio') _id: string,
  ) {
    const desafio: Desafio = await lastValueFrom(
      this.clientDesafios.send('consultar-desafios', {
        idJogador: '',
        _id: _id,
      }),
    );

    this.logger.log(`desafio: ${JSON.stringify(desafio)}`);

    if (!desafio) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    if (desafio.status == DesafioStatus.REALIZADO) {
      throw new BadRequestException(`Desafio já realizado!`);
    }

    if (desafio.status !== DesafioStatus.ACEITO) {
      throw new BadRequestException(
        `Partidas somente podem ser lançadas em desafios aceitos pelos adversários!`,
      );
    }

    if (!desafio.jogadores.includes(atribuirDesafioPartidaDto.def)) {
      throw new BadRequestException(
        `O jogador vencedor da partida deve fazer parte do desafio!`,
      );
    }

    const partida: Partida = {};
    partida.categoria = desafio.categoria;
    partida.def = atribuirDesafioPartidaDto.def;
    partida.desafio = _id;
    partida.jogadores = desafio.jogadores;
    partida.resultado = atribuirDesafioPartidaDto.resultado;

    this.clientDesafios.emit('criar-partida', partida);
  }

  @Delete('/:_id')
  async deletarDesafio(@Param('_id') _id: string) {
    const desafio: Desafio = await lastValueFrom(
      this.clientDesafios.send('consultar-desafios', {
        idJogador: '',
        _id: _id,
      }),
    );

    this.logger.log(`desafio: ${JSON.stringify(desafio)}`);

    if (!desafio) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    this.clientDesafios.emit('deletar-desafio', desafio);
  }
}
