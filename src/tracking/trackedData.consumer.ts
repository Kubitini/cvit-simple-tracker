import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QueuesEnum } from '../redis/queues.enum';
import { Job } from 'bullmq';
import { FileWriter } from '../storage/filewriter.repository';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../app/app.config';
import { nameof } from 'ts-simple-nameof';
import { JobsEnum } from '../redis/jobs.enum';
import { throwCompileTimeErrorIfSwitchCaseNotImplemented } from '../utils/helpers';
import { TrackedDataMapper } from './trackedData.mapper';
import { Logger } from '@nestjs/common';

/**
 * Todo: Could be further improved by running as a separate process:
 *  See the https://docs.nestjs.com/techniques/queues#separate-processes
 */
@Processor(QueuesEnum.TRACKED_DATA)
export class TrackedDataConsumer extends WorkerHost {
  private readonly logger = new Logger(nameof(TrackedDataConsumer)); // todo: improve by providing via DI
  private readonly path: string;

  constructor(
    private fileWriter: FileWriter,
    private config: ConfigService<AppConfig, true>, // Relying on having set the nestjs configuration module globally
    private mapper: TrackedDataMapper, // Relying on having set the mappers module globally
  ) {
    super();

    this.path = this.config.get<string>(
      nameof<AppConfig>((p) => p.dataFilePath),
      { infer: true },
    );
  }

  async process(job: Job<string, boolean, JobsEnum>): Promise<boolean> {
    switch (job.name) {
      case JobsEnum.STORE: {
        await this.fileWriter.appendToFile(
          this.path,
          (await this.mapper.fromQueueData(job.data)).rawJson,
        );
        this.logger.log(`Successfully processed '${job.name}' job.`);
        return true;
      }
      default:
        throwCompileTimeErrorIfSwitchCaseNotImplemented(job.name);
        throw new Error(`Unsupported job ${job.name}.`);
    }
  }
}
