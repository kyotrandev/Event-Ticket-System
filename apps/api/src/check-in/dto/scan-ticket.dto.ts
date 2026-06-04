import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ScanTicketDto {
  @ApiProperty({ description: 'Ticket code (UUID) from QR payload field c' })
  @IsUUID()
  code: string;

  @ApiProperty({ description: 'Event the staff member is checking in for' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ description: 'HMAC signature from QR payload field s' })
  @IsString()
  @IsNotEmpty()
  s: string;
}
