import { Module } from '@nestjs/common';
import { EventStaffAssignmentsService } from './event-staff-assignments.service';
import { RelationalEventStaffAssignmentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalEventStaffAssignmentPersistenceModule],
  providers: [EventStaffAssignmentsService],
  exports: [EventStaffAssignmentsService],
})
export class EventStaffAssignmentsModule {}
