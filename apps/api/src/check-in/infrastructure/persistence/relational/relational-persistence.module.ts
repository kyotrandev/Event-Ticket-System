import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInLogEntity } from './entities/check-in-log.entity';
import { CheckInLogRelationalRepository } from './repositories/check-in-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CheckInLogEntity])],
  providers: [CheckInLogRelationalRepository],
  exports: [CheckInLogRelationalRepository],
})
export class RelationalCheckInPersistenceModule {}
