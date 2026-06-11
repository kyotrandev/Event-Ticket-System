import { ApiProperty } from '@nestjs/swagger';

export class OrganizerStatsDto {
  @ApiProperty()
  totalEvents: number;

  @ApiProperty()
  liveNow: number;

  @ApiProperty({
    description:
      'Net revenue from PAID bookings across all organizer events (VND); refunded bookings excluded',
  })
  totalRevenue: number;

  @ApiProperty()
  totalTicketsSold: number;

  @ApiProperty()
  draftCount: number;

  @ApiProperty()
  upcomingCount: number;
}
