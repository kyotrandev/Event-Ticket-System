import { ApiProperty } from '@nestjs/swagger';
import { CheckInMethodEnum } from '../check-in-method.enum';

export class CheckInLog {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  ticketId: string;

  @ApiProperty({ type: String })
  eventId: string;

  @ApiProperty({ type: String })
  staffId: string;

  @ApiProperty()
  scannedAt: Date;

  @ApiProperty({ enum: CheckInMethodEnum })
  method: CheckInMethodEnum;
}
