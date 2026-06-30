import { Global, Module } from '@nestjs/common';
import { RequestQueue } from './request.queue';

@Global()
@Module({
  providers: [RequestQueue],
  exports: [RequestQueue],
})
export class QueueModule {}
