/**
 * @jest-environment ../../../test/envs/redis.testcontainer.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { nameof } from 'ts-simple-nameof';
import { TrackingService } from './tracking.service';
import { TrackedData } from './trackedData.domain';
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { TrackedDataMapper } from './trackedData.mapper';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../config/config.module';
import * as assert from 'node:assert';
import { asTrackedData } from '../utils/helpers';

describe(nameof(TrackingService), () => {
  const oldEnv = process.env;

  const redisCountKey = 'testCount';
  const redisJobName = 'testJob';
  const redisQueueName = 'testQueue';

  let trackingService: TrackingService;
  let redis: Redis;
  let queue: Queue;
  let redisCountBeforeTest: number;

  beforeAll(async () => {
    process.env.REDIS_HOST = globalThis.redisHost;
    process.env.REDIS_PORT = globalThis.redisPort.toString();
  });

  afterAll(async () => {
    process.env = oldEnv;
  });

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, ConfigModule],
      providers: [TrackedDataMapper],
    }).compile();

    redis = app.get(Redis);
    queue = new Queue(redisQueueName, {
      connection: {
        host: globalThis.redisHost,
        port: globalThis.redisPort,
      },
    });

    trackingService = new TrackingService(
      queue,
      redis,
      app.get(TrackedDataMapper),
      redisCountKey,
      redisJobName,
    );

    redisCountBeforeTest = Number(await redis.get(redisCountKey));
  });

  describe(
    nameof<TrackingService>((p) => p.track),
    () => {
      it.each([
        [asTrackedData({ count: 4 }), 4],
        [asTrackedData({}), 0],
        [asTrackedData({ count: 21, test: { count: 3 } }), 21],
        [asTrackedData({ type: 'test' }), 0],
        [asTrackedData({ name: 'test', count: 1 }), 1],
      ])(
        'increments redis count appropriately',
        async (trackedData: TrackedData, expectedIncrement: number) => {
          await trackingService.track(trackedData);

          const redisCount = Number(await redis.get(redisCountKey));
          const expectedCount = redisCountBeforeTest + expectedIncrement;
          assert(
            redisCount > redisCountBeforeTest ||
              redisCountBeforeTest == expectedCount,
            'Expected redis count to be incrementing in between tests.',
          ); // just a sanity check
          expect(redisCount).toBe(expectedCount);
        },
      );

      it(`stores data in redis queue`, async () => {
        const expectedQueueCount = (await queue.count()) + 1;

        await trackingService.track(asTrackedData({ name: 'test', count: 5 }));

        const queueCount = await queue.count();
        expect(queueCount).toBe(expectedQueueCount);
      });
    },
  );

  describe(
    nameof<TrackingService>((p) => p.getCount),
    () => {
      it('returns 0 if redis key does NOT exist', async () => {
        await redis.del(redisCountKey);

        const result = await trackingService.getCount();

        expect(result).toBe(0);
      });

      it.each([0, 1, 5, 8, 5678])(
        `returns correct count`,
        async (expectedCount) => {
          await redis.set(redisCountKey, expectedCount);

          const result = await trackingService.getCount();

          expect(result).toBe(expectedCount);
        },
      );
    },
  );
});
