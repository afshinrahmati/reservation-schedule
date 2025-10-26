import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ example: 30 }) @IsInt() @Min(5) slotDurationMin: number;
}
