import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackedDataDto } from './trackedData.dto';
import { RawBodyRequest } from '@nestjs/common';
import { nameof } from 'ts-simple-nameof';

describe(nameof(TrackingController), () => {
  let trackingController: TrackingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [TrackingController],
      providers: [TrackingService],
    })
      .overrideProvider(TrackingService)
      .useValue({}) // not needed for the current scope of the tests
      .compile();

    trackingController = app.get(TrackingController);
  });

  describe(
    nameof<TrackingController>((p) => p.track),
    () => {
      it('should throw error if unable to obtain data', async () => {
        await expect(() =>
          trackingController.track(
            {} as TrackedDataDto,
            {} as RawBodyRequest<Request>,
          ),
        ).rejects.toThrow();
      });
    },
  );
});
