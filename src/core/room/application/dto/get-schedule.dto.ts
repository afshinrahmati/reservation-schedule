import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional, Min } from 'class-validator';

export class GetScheduleDto {
  @ApiPropertyOptional({ example: 15, description: 'Days Time' })
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @ApiPropertyOptional({
    example: '2025-10-22T00:00:00.000Z',
    description: 'Date',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;
}
