import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailQueue {
  constructor(
    @InjectQueue('emails')
    private readonly queue: Queue,
  ) {}

  async sendEmail(data: { userId: string; email: string; type: string }) {
    await this.queue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
