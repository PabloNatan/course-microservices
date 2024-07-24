import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RankingsService } from './rankings.service';
import { Partida } from './schemas/partida.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  private readonly logger = new Logger(RankingsController.name);

  @EventPattern('processar-partida')
  async processarPartida(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`data: ${JSON.stringify(data)}`);
      const idPartida: string = data.idPartida;
      const partida: Partida = data.partida;
      await this.rankingsService.processarPartida(idPartida, partida);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`);
      const filterAckError = ackErrors.find((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError) {
        await channel.ack(originalMsg);
      }
    }
  }
}
