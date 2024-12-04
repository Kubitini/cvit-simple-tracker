import { Test, TestingModule } from '@nestjs/testing';
import { nameof } from 'ts-simple-nameof';
import { TrackedDataMapper } from './trackedData.mapper';
import { asTrackedData } from '../utils/helpers';

describe(nameof(TrackedDataMapper), () => {
  const expectedJson = { id: 1234, type: 'sample-data', count: 8 };

  let trackedDataMapper: TrackedDataMapper;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [TrackedDataMapper],
    }).compile();

    trackedDataMapper = app.get(TrackedDataMapper);
  });

  describe(
    nameof<TrackedDataMapper>((p) => p.fromQueueData),
    () => {
      it(`keeps parity with ${nameof<TrackedDataMapper>((p) => p.toQueueData)}`, async () => {
        const data = await trackedDataMapper.toQueueData(
          asTrackedData(expectedJson),
        );

        const result = await trackedDataMapper.fromQueueData(data);

        expect(JSON.parse(result.rawJson.toString())).toStrictEqual(
          expectedJson,
        );
      });
    },
  );
});
