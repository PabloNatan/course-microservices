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
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { lastValueFrom, Observable } from 'rxjs';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';
import { ValidacaoParametrosPipe } from 'src/common/pipes/validacao-parametros.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/aws/aws.service';

@Controller('api/v1/jogadores')
export class JogadoresController {
  private logger = new Logger(JogadoresController.name);

  constructor(
    private clientProxySmartRanking: ClientProxySmartRanking,
    private awsService: AwsService,
  ) {}

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post()
  @UsePipes(ValidationPipe)
  async criarJogador(@Body() criarJogadorDto: CriarJogadorDto): Promise<void> {
    this.logger.log(`criarJogadorDto: ${JSON.stringify(criarJogadorDto)}`);

    const categoria = await lastValueFrom(
      this.clientAdminBackend.send(
        'consultar-categorias',
        criarJogadorDto.categoria,
      ),
    );

    if (categoria) {
      this.clientAdminBackend.emit('criar-jogador', criarJogadorDto);
    } else {
      throw new BadRequestException(`Categoria não cadastrada!`);
    }
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async atualizarJogador(
    @Body() atualizarJogadorDto: AtualizarJogadorDto,
    @Param('_id', ValidacaoParametrosPipe) _id: string,
  ): Promise<void> {
    this.logger.log(
      `AtualizarJogadorDto: ${JSON.stringify(atualizarJogadorDto)}, ${_id}`,
    );

    let categoria = null;
    if (atualizarJogadorDto.categoria) {
      categoria = await lastValueFrom(
        this.clientAdminBackend.send(
          'consultar-categorias',
          atualizarJogadorDto.categoria,
        ),
      );
    }

    if (atualizarJogadorDto.categoria && !categoria) {
      throw new BadRequestException(`Categoria não cadastrada!`);
    }

    this.clientAdminBackend.emit('atualizar-jogador', {
      _id,
      ...atualizarJogadorDto,
    });
  }

  @Get()
  consultarJogadores(): Observable<any> {
    return this.clientAdminBackend.send('consultar-jogadores', '');
  }

  @Get('/:_id')
  async consultarJogadorPorId(
    @Param('_id', ValidacaoParametrosPipe) _id: string,
  ) {
    return this.clientAdminBackend.send('consultar-jogador', _id);
  }

  @Delete('/:_id')
  async deletarJogador(@Param('_id', ValidacaoParametrosPipe) _id: string) {
    return this.clientAdminBackend.emit('deletar-jogador', _id);
  }

  @Post('/:_id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadArquivo(@UploadedFile() file, @Param('_id') _id: string) {
    const jogador = await lastValueFrom(
      this.clientAdminBackend.send('consultar-jogador', _id),
    );

    if (!jogador) {
      throw new BadRequestException(`Jogador Id: ${_id} não encontrado`);
    }

    const uploadedFile = await this.awsService.uploadArquivo(file, _id);

    const atualizarJogadorDto: AtualizarJogadorDto = {
      urlFotoJogador: uploadedFile?.url,
    };

    this.clientAdminBackend.emit('atualizar-jogador', {
      _id,
      ...atualizarJogadorDto,
    });

    // Jogador Atualizado
    return lastValueFrom(
      this.clientAdminBackend.send('consultar-jogador', _id),
    );
  }
}
