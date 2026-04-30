import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { EmailQueue } from './email.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'emails',
    }),
  ],
  providers: [EmailQueue, EmailProcessor],
  exports: [EmailQueue],
})
export class QueuesModule {}