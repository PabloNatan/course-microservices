import { Module } from '@nestjs/common';
import { CategoriasModule } from './categorias/categorias.module';
import { JogadoresModule } from './jogadores/jogadores.module';
import { ProxyRMQModule } from './proxyrmq/proxyRMQ.module';
import { AwsModule } from './aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { DesafiosModule } from './desafios/desafios.module';
import { RankingsModule } from './rankings/rankings.module';

@Module({
  imports: [
    CategoriasModule,
    ProxyRMQModule,
    JogadoresModule,
    AwsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DesafiosModule,
    RankingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
