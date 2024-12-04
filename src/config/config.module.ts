import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from '../app/app.config';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
  ],
})
export class ConfigModule {}
