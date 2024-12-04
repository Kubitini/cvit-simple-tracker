/**
 * @jest-environment ./envs/redis.testcontainer.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { nestAppOptions, setupApp } from '../src/app/setup';

describe('App (e2e)', () => {
  const oldEnv = process.env;

  let app: INestApplication;

  beforeAll(async () => {
    process.env.REDIS_HOST = globalThis.redisHost;
    process.env.REDIS_PORT = globalThis.redisPort.toString();
  });

  afterAll(async () => {
    process.env = oldEnv;
    await app.close();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(nestAppOptions);
    setupApp(app);
    await app.init();
  });

  describe('/count (GET)', () => {
    it('responds with the numeric count in the body', async () => {
      return request(app.getHttpServer())
        .get('/count')
        .then((response) => JSON.parse(response.text))
        .then((count) => {
          expect(count).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('/track (POST)', () => {
    it.each([{}, { count: 5 }, { string: 'value', float: 2.85 }])(
      'accepts data in the JSON format',
      async (validJson) => {
        return request(app.getHttpServer())
          .post('/track')
          .send(validJson)
          .expect(204);
      },
    );

    describe('responds with validation errors', () => {
      it.each(['{invalid_json}', 'json=invalid', '<not>json</not>'])(
        'when data is NOT in JSON format',
        async (nonJsonData) => {
          return request(app.getHttpServer())
            .post('/track')
            .send(nonJsonData)
            .type('json')
            .expect(400);
        },
      );

      it.each(['five', 2.5])(
        'when count in JSON root is NOT integer',
        async (count: unknown) => {
          return request(app.getHttpServer())
            .post('/track')
            .send({ count: count })
            .expect(400)
            .then((response) => {
              expect(response.body.message).toContain(
                'count must be an integer number',
              );
            });
        },
      );
    });
  });
});
