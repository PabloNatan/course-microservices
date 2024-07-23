import { Module } from '@nestjs/common';
import { ClientProxySmartRanking } from './clinet-proxy';

@Module({
  providers: [ClientProxySmartRanking],
  exports: [ClientProxySmartRanking],
})
export class ProxyRmqModule {}
