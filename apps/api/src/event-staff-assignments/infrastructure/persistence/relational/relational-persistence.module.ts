import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventStaffAssignmentEntity } from './entities/event-staff-assignment.entity';
import { EventStaffAssignmentRelationalRepository } from './repositories/event-staff-assignment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EventStaffAssignmentEntity])],
  providers: [EventStaffAssignmentRelationalRepository],
  exports: [EventStaffAssignmentRelationalRepository],
})
export class RelationalEventStaffAssignmentPersistenceModule {}
