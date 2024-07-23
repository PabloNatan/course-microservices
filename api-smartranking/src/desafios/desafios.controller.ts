import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Desafio } from './schemas/desafios.schema';
import { DesafiosService } from './desafios.service';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { DesafioStatusValidavaoPipe } from './pipes/desafio-status-validation.pipe';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';

@Controller('api/v1/desafios')
export class DesafiosController {
  constructor(private readonly desafiosService: DesafiosService) {}

  private readonly logger = new Logger(DesafiosController.name);

  @Post()
  @UsePipes(ValidationPipe)
  async criarDesafio(
    @Body() criarDesafioDto: CriarDesafioDto,
  ): Promise<Desafio> {
    this.logger.log(`criarDesafioDto: ${JSON.stringify(criarDesafioDto)}`);
    return this.desafiosService.criarDesafio(criarDesafioDto);
  }

  @Get()
  async consultarDesafios(
    @Query('idJogador') idJogador?: string,
  ): Promise<Desafio[]> {
    return idJogador
      ? this.desafiosService.consultarDesafiosDeUmJogador(idJogador)
      : this.desafiosService.consultarTodosDesafios();
  }

  @Put('/:_id')
  async atualizarDesafio(
    @Body(DesafioStatusValidavaoPipe) atualizarDesafioDto: AtualizarDesafioDto,
    @Param('_id') _id: string,
  ) {
    await this.desafiosService.atualizarDesafio(_id, atualizarDesafioDto);
  }

  @Post('/:_id/partida')
  async atribuirDesafioPartida(
    @Body(ValidationPipe) atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
    @Param('_id') _id: string,
  ) {
    return await this.desafiosService.atribuirDesafioPartida(
      _id,
      atribuirDesafioPartidaDto,
    );
  }
}
