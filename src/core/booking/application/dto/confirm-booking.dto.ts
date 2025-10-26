import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}
