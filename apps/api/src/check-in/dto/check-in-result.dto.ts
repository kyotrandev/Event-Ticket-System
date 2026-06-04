import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type CheckInStatus = 'VALID' | 'ALREADY_USED' | 'INVALID' | 'NOT_FOUND';

export class CheckInResultDto {
  @ApiProperty({ enum: ['VALID', 'ALREADY_USED', 'INVALID', 'NOT_FOUND'] })
  status: CheckInStatus;

  @ApiPropertyOptional()
  attendeeName?: string;

  @ApiPropertyOptional()
  ticketTypeName?: string;

  @ApiPropertyOptional()
  ticketCode?: string;

  @ApiPropertyOptional()
  originalScannedAt?: Date;

  @ApiPropertyOptional()
  staffName?: string;
}
