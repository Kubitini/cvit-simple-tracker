import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackedDataMapper } from './trackedData.mapper';
import { TrackedDataConsumer } from './trackedData.consumer';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [TrackingController],
  providers: [TrackingService, TrackedDataMapper, TrackedDataConsumer],
})
export class TrackingModule {}
