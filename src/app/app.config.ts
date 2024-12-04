import { RedisOptions } from 'ioredis';

export type AppConfig = {
  port: number;
  redis: RedisOptions;
  dataFilePath: string;
};

/**
 * See the .env file.
 */
export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '', 10) || 6379,
  },
  dataFilePath: process.env.DATA_FILEPATH || './data',
});
