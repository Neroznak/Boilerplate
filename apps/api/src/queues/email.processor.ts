import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('emails')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  // BullMQ requires this method to return a Promise.
  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job<{ userId: string; email: string; type: string }>) {
    if (job.name !== 'send-email') {
      return;
    }

    this.logger.log({
      message: 'Processing email job',
      jobId: job.id,
      data: job.data,
    });
  }
}
