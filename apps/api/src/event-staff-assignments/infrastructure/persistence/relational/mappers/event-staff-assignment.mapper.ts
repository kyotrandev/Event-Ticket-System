import { EventStaffAssignment } from '../../../../domain/event-staff-assignment';
import { EventStaffAssignmentEntity } from '../entities/event-staff-assignment.entity';

export class EventStaffAssignmentMapper {
  static toDomain(raw: EventStaffAssignmentEntity): EventStaffAssignment {
    const domain = new EventStaffAssignment();
    domain.id = raw.id;
    domain.eventId = raw.eventId;
    domain.staffId = raw.staffId;
    domain.assignedAt = raw.assignedAt;
    return domain;
  }

  static toPersistence(
    domain: EventStaffAssignment,
  ): EventStaffAssignmentEntity {
    const entity = new EventStaffAssignmentEntity();
    if (domain.id) entity.id = domain.id;
    entity.eventId = domain.eventId;
    entity.staffId = domain.staffId;
    return entity;
  }
}
