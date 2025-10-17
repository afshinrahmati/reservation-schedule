import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { IsUUID, IsISO8601 } from 'class-validator';

export class CreateRoomDto {
    @IsNotEmpty() name: string;
    @IsInt() @Min(15) slotDurationMinutes: number;
}

export class CreateBookingDto {
    @IsUUID() roomId: string;
    @IsISO8601() startAt: string;
}

export class ConfirmBookingDto {
    @IsUUID() bookingId: string;
}