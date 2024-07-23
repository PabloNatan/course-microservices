import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExecptionFilter } from './common/filters/http-execption.filter';
import * as moment from 'moment-timezone';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExecptionFilter());
  Date.prototype.toJSON = function (): any {
    return moment.tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss.SSS');
  };
  await app.listen(8080);
}
bootstrap();
