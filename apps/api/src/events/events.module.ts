import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RelationalEventPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { EventStaffAssignmentsModule } from '../event-staff-assignments/event-staff-assignments.module';

@Module({
  imports: [RelationalEventPersistenceModule, EventStaffAssignmentsModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService, RelationalEventPersistenceModule],
})
export class EventsModule {}
