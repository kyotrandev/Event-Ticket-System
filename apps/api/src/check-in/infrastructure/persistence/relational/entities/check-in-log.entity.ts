import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CheckInMethodEnum } from '../../../../check-in-method.enum';

@Entity({ name: 'check_in_log' })
export class CheckInLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  ticketId: string;

  @Index()
  @Column({ type: 'uuid' })
  eventId: string;

  @Index()
  @Column({ type: String })
  staffId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  scannedAt: Date;

  @Column({ type: 'enum', enum: CheckInMethodEnum })
  method: CheckInMethodEnum;
}
