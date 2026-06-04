import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ManualCheckInDto {
  @ApiProperty({ description: 'Ticket code (UUID) entered manually' })
  @IsUUID()
  code: string;

  @ApiProperty()
  @IsUUID()
  eventId: string;
}
