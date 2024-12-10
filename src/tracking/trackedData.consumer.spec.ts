/**
 * @jest-environment ../../../test/envs/redis.testcontainer.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { nameof } from 'ts-simple-nameof';
import { TrackedDataConsumer } from './trackedData.consumer';
import { ConfigModule } from '../config/config.module';
import { Job } from 'bullmq';
import { JobsEnum } from '../redis/jobs.enum';
import { RedisModule } from '../redis/redis.module';
import { TrackingService } from './tracking.service';
import { asTrackedData, waitFor } from '../utils/helpers';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../app/app.config';
import * as mockFs from 'mock-fs';
import { promises as fs } from 'fs';
import { StorageModule } from '../storage/storage.module';
import { INestApplication } from '@nestjs/common';
import { TrackedDataMapper } from './trackedData.mapper';

// REVIEW: Proč se používá "nameof" místo "TrackedDataConsumer.name"?
describe(nameof(TrackedDataConsumer).split(' ')[0], () => {
  const oldEnv = process.env;

  let app: INestApplication;
  let trackedDataConsumer: TrackedDataConsumer;
  let trackingService: TrackingService;

  let dataFilePath: string;

  beforeAll(async () => {
    process.env.REDIS_HOST = globalThis.redisHost;
    process.env.REDIS_PORT = globalThis.redisPort.toString();
  });

  afterAll(async () => {
    process.env = oldEnv;
  });

  // REVIEW: Proč se nastavuje celá aplikace kvůli unit testům?
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, RedisModule, StorageModule],
      providers: [TrackedDataMapper, TrackedDataConsumer, TrackingService],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init(); // important, otherwise the consumer does not work as expected

    trackedDataConsumer = app.get(TrackedDataConsumer);
    trackingService = app.get(TrackingService);
    const config = app.get(ConfigService<AppConfig, true>);

    dataFilePath = config.get<string>(
      nameof<AppConfig>((p) => p.dataFilePath),
      { infer: true },
    );

    mockFs(); // to avoid polluting the actual file system
  });

  afterEach(async () => {
    mockFs.restore();
    await app.close();
  });

  describe(
    nameof<TrackedDataConsumer>((p) => p.process),
    () => {
      it('should throw error for unsupported job names', async () => {
        await expect(() =>
          trackedDataConsumer.process({ name: 'unsupported' } as unknown as Job<
            string,
            boolean,
            JobsEnum
          >),
        ).rejects.toThrow();
      });

      // REVIEW: Test by mohl být mnohem jednodušší, kdyby se používal dependency inversion
      // REVIEW: Test by měl mít strukturu: setup -> action -> expect
      it(`should store jobs in file as FIFO`, async () => {
        // REVIEW: Zbytečně složité
        const orderedData = [...Array(3).keys()].map((index) =>
          asTrackedData({ order: index }),
        );

        for (const data of orderedData) {
          await trackingService.track(data);
        }

        const expectedFileContent = orderedData
          .map((data) => data.rawJson.toString())
          .join('');
        const dataFileCreated = await waitFor(async () => {
          try {
            await fs.access(dataFilePath);
            return true;
          } catch {
            return false;
          }
        });
        expect(dataFileCreated).toBeTruthy();
        let dataFileContent = '';
        await waitFor(async () => {
          dataFileContent = (await fs.readFile(dataFilePath)).toString();
          return dataFileContent.length >= expectedFileContent.length;
        });
        expect(dataFileContent).toBe(expectedFileContent);
      }, 10000);
    },
  );
});
