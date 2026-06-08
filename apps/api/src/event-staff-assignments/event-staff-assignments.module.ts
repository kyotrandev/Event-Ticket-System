import { Module } from '@nestjs/common';
import { EventStaffAssignmentsService } from './event-staff-assignments.service';
import { RelationalEventStaffAssignmentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    RelationalEventStaffAssignmentPersistenceModule,
    MailModule,
    JwtModule.register({}),
  ],
  providers: [EventStaffAssignmentsService],
  exports: [EventStaffAssignmentsService],
})
export class EventStaffAssignmentsModule {}
