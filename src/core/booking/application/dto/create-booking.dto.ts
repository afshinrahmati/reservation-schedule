import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsISO8601, IsInt, Min } from 'class-validator';
export class CreateBookingDto {
    @ApiProperty() @IsUUID() roomId: string;
    @ApiProperty({ example: new Date().toISOString() }) @IsISO8601() startAt: string;
    @ApiProperty({ example: 30 }) @IsInt() @Min(5) slotDurationMin: number;
}