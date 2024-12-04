import { Module } from '@nestjs/common';
import { FileWriter } from './filewriter.repository';

@Module({
  providers: [FileWriter],
  exports: [FileWriter],
})
export class StorageModule {}
