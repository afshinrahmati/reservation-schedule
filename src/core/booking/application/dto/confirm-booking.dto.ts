import {ApiProperty} from "@nestjs/swagger";
import {IsUUID} from "class-validator";

export class ConfirmBookingDto { @ApiProperty() @IsUUID() bookingId: string; }
