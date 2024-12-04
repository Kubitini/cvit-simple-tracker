import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../config/config.module';
import { TrackingModule } from '../tracking/tracking.module';
import { StorageModule } from '../storage/storage.module';
import { AppController } from './app.controller';

@Module({
  imports: [ConfigModule, RedisModule, TrackingModule, StorageModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
