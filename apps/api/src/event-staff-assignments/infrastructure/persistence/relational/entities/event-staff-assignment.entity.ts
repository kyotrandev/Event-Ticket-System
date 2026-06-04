import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({ name: 'event_staff_assignment' })
@Unique(['eventId', 'staffId'])
export class EventStaffAssignmentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  eventId: string;

  @Index()
  @Column({ type: String })
  staffId: string;

  @CreateDateColumn()
  assignedAt: Date;
}
