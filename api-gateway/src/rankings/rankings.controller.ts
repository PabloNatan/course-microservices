import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ValidacaoParametrosPipe } from 'src/common/pipes/validacao-parametros.pipe';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';

@Controller('api/v1/rankings')
export class RankingsController {
  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private clientRankingsBackend =
    this.clientProxySmartRanking.getClientProxyRankingsInstance();

  @Get()
  @UsePipes(ValidationPipe)
  consultarRankings(
    @Query('idCategoria', ValidacaoParametrosPipe) idCategoria: string,
    @Query('dataRef') dataRef: string,
  ): Promise<any> {
    return lastValueFrom(
      this.clientRankingsBackend.send('consultar-rankings', {
        idCategoria,
        dataRef: dataRef ? dataRef : '',
      }),
    );
  }
}
