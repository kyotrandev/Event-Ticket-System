import { CheckInLog } from '../../../../domain/check-in-log';
import { CheckInLogEntity } from '../entities/check-in-log.entity';

export class CheckInLogMapper {
  static toDomain(raw: CheckInLogEntity): CheckInLog {
    const domain = new CheckInLog();
    domain.id = raw.id;
    domain.ticketId = raw.ticketId;
    domain.eventId = raw.eventId;
    domain.staffId = raw.staffId;
    domain.scannedAt = raw.scannedAt;
    domain.method = raw.method;
    return domain;
  }
}
