import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
/**
 * Todo: Should we be running multiple instances of this app simultaneously e.g. with a load balancer,
 *  we could e.g. introduce file locking, or ensure that only a single instance can write at a time, etc.
 *  but for our purposes (in the single instance mode), the FIFO queue solution is more than enough
 *  (to avoid any request concurrency issues related to writing to the file system).
 */
export class FileWriter {
  async appendToFile(path: string, data: Buffer): Promise<void> {
    await fs.appendFile(path, data);
  }
}
