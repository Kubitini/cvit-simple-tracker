import { TestEnvironment as NodeEnvironment } from 'jest-environment-node';
import { StartedTestContainer, Wait } from 'testcontainers';
import { RedisContainer } from '@testcontainers/redis';
import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';

const redisImage = 'redis:7-alpine';
const redisExposedPort = 6379;

export default class RedisEnvironment extends NodeEnvironment {
  private redis: StartedTestContainer;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
  }

  async setup() {
    await super.setup();

    this.redis = await new RedisContainer(redisImage)
      .withExposedPorts(redisExposedPort)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();

    this.global.redisHost = this.redis.getHost();
    this.global.redisPort = this.redis.getMappedPort(redisExposedPort);
  }

  async teardown() {
    await super.teardown();

    await this.redis.stop();
  }

  getVmContext() {
    return super.getVmContext();
  }
}
