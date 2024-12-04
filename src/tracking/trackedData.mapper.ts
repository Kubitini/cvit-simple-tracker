import { Injectable } from '@nestjs/common';
import { TrackedData } from './trackedData.domain';

@Injectable()
export class TrackedDataMapper {
  async toQueueData(data: TrackedData): Promise<string> {
    return data.rawJson.toString('base64'); // todo: unfortunately, the nestjs/bull-mq does not support sending Buffer
  }

  async fromQueueData(data: string): Promise<TrackedData> {
    return { rawJson: Buffer.from(data, 'base64') };
  }
}
