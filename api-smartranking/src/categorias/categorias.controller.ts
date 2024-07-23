import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { Categoria } from './schemas/categoria.schema';
import { CategoriasService } from './categorias.service';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { ValidacaoParametrosPipe } from 'src/common/pipes/validacao-parametros.pipe';

@Controller('api/categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarCategoria(
    @Body() criarCategoriaDto: CriarCategoriaDto,
  ): Promise<Categoria> {
    return await this.categoriasService.criarCategoria(criarCategoriaDto);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async atualizarCategoria(
    @Param('_id', ValidacaoParametrosPipe) _id: string,
    @Body() atualizarCategoriaDto: AtualizarCategoriaDto,
  ) {
    return await this.categoriasService.atualizarCategoria(
      _id,
      atualizarCategoriaDto,
    );
  }

  @Get()
  async consultarCategorias(): Promise<Categoria[]> {
    return await this.categoriasService.consultarCategorias();
  }

  @Get('/:categoria')
  async recuperarCategoriaPorCategoria(
    @Param('categoria', ValidacaoParametrosPipe) _id: string,
  ): Promise<Categoria> {
    return this.categoriasService.recuperarCategoriaPorCategoria(_id);
  }

  @Post('/:categoria/jogadores/:idJogador')
  async atribuirCategoriaJogador(@Param() params: string[]): Promise<void> {
    return await this.categoriasService.atribuirCategoriaJogador(params);
  }
}
