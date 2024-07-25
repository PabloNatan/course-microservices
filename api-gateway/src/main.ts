import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExecptionFilter } from './common/filters/http-execption.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.useGlobalFilters(new AllExecptionFilter());

  // Date.prototype.toJSON = function (): any {
  //   return moment.tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss.SSS');
  // };

  await app.listen(8080);
}
bootstrap();
