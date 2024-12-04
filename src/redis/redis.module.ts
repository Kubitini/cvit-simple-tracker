import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';
import { nameof } from 'ts-simple-nameof';
import { AppConfig } from '../app/app.config';
import { BullModule } from '@nestjs/bullmq';
import { QueuesEnum } from './queues.enum';

const redisOptions = 'REDIS_OPTIONS';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisModule],
      inject: [redisOptions],
      useFactory: (options: RedisOptions) => ({
        connection: options,
      }),
    }),
    BullModule.registerQueue({
      // todo: Unfortunately, this also causes Jest tests to hang, solved by adding --forceExit in package.json
      name: QueuesEnum.TRACKED_DATA,
    }),
  ],
  controllers: [],
  providers: [
    {
      inject: [ConfigService], // Relying on having set the nestjs configuration module globally
      provide: redisOptions,
      useFactory: async (config: ConfigService<AppConfig, true>) => {
        return config.get<RedisOptions>(
          nameof<AppConfig>((p) => p.redis),
          { infer: true },
        ) satisfies RedisOptions;
      },
    },
    {
      inject: [redisOptions],
      provide: Redis,
      useFactory: async (options: RedisOptions) => {
        return new Redis(options);
      },
    },
  ],
  exports: [BullModule, redisOptions, Redis],
})
export class RedisModule {}
