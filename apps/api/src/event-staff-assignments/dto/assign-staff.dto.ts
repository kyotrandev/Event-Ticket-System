import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignStaffDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  staffId: string;
}
