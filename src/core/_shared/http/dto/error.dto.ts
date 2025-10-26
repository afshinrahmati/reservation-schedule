import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ErrorDto {
  @ApiProperty({ example: 'a1b2-...' }) @IsString() traceId: string;
  @ApiProperty({ example: 'IDENTITY.USER_NOT_FOUND' }) @IsString() code: string;
  @ApiProperty({ example: 'کاربر پیدا نشد' }) @IsString() message: string;
  @ApiPropertyOptional({ example: { field: 'email' } })
  @IsNotEmpty()
  details?: any;
}
