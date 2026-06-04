import { Module } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';
import { RelationalCheckInPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { EventStaffAssignmentsModule } from '../event-staff-assignments/event-staff-assignments.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    RelationalCheckInPersistenceModule,
    EventStaffAssignmentsModule,
    TicketsModule,
  ],
  controllers: [CheckInController],
  providers: [CheckInService],
})
export class CheckInModule {}
