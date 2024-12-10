import { Injectable, Logger, Optional } from '@nestjs/common';
import { TrackedData } from './trackedData.domain';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { QueuesEnum } from '../redis/queues.enum';
import { JobsEnum } from '../redis/jobs.enum';
import { TrackedDataMapper } from './trackedData.mapper';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(nameof(TrackingService)); // todo: improve by providing via DI

  constructor(
    @InjectQueue(QueuesEnum.TRACKED_DATA) private trackedDataQueue: Queue,
    private redis: Redis,
    private mapper: TrackedDataMapper, // Relying on having set the mappers module globally
    @Optional() private redisCountKey = 'count',
    @Optional() private redisJobName: JobsEnum | string = JobsEnum.STORE,
  ) {}

  async getCount(): Promise<number> {
    const count = (await this.redis.get(this.redisCountKey)) ?? 0;
    return Number(count); // REVIEW: Why not use parseInt? This returns instance of class Number, but the function should return primitive "number"
  }

  async track(data: TrackedData) {
    await this.trackedDataQueue.add(
      this.redisJobName,
      await this.mapper.toQueueData(data),
    );

    if (data.count) {
      await this.redis.incrby(this.redisCountKey, data.count); // will create the count if not exists
      this.logger.log(`Increased the counter by ${data.count}.`);
    } else {
      this.logger.warn(`Received data with NO count property or ZERO.`);
    }
  }
}
