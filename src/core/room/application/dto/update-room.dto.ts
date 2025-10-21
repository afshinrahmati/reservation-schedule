import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class UpdateRoomDto {
    @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
    @ApiPropertyOptional({ example: 30 }) @IsOptional() @IsInt() @Min(5) slotDurationMin?: number;
}