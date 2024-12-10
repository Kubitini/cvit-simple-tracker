import { Injectable } from '@nestjs/common';
import { TrackedData } from './trackedData.domain';

// REVIEW: Je tohle potřeba? Proč se nepošle objekt?
@Injectable()
export class TrackedDataMapper {
  async toQueueData(data: TrackedData): Promise<string> {
    // REVIEW: Tak proč se nepošle celý objekt?
    return data.rawJson.toString('base64'); // todo: unfortunately, the nestjs/bull-mq does not support sending Buffer
  }

  async fromQueueData(data: string): Promise<TrackedData> {
    return { rawJson: Buffer.from(data, 'base64') };
  }
}
