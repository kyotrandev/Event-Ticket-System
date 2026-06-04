import { ApiProperty } from '@nestjs/swagger';

export class EventStaffAssignment {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  eventId: string;

  @ApiProperty({ type: String })
  staffId: string;

  @ApiProperty()
  assignedAt: Date;
}
