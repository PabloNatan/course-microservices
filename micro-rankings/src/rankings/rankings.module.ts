import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { Ranking, RankingSchema } from './schemas/ranking.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProxyRmqModule } from 'src/proxyrmq/proxyrmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ranking.name, schema: RankingSchema }]),
    ProxyRmqModule,
  ],
  providers: [RankingsService],
  controllers: [RankingsController],
})
export class RankingsModule {}
