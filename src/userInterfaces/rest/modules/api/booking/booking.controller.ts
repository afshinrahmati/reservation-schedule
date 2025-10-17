import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {JwtAuthGuard} from "@/userInterfaces/rest/components/guards/jwt-auth.guard";
import {ConfirmBookingDto, CreateBookingDto} from "@/userInterfaces/rest/modules/api/booking/booking.dto";
import {CreateBookingHandler} from "@/core/booking/application/create-booking.handler";
import {ConfirmBookingHandler} from "@/core/booking/application/confirm-booking.handler";
import {CreateBookingCommand} from "@/core/booking/application/create-booking.command";
import {ConfirmBookingCommand} from "@/core/booking/application/confirm-booking.command";


@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
    constructor(
        private readonly createBooking: CreateBookingHandler,
        private readonly confirmBooking: ConfirmBookingHandler,
    ) {}

    @Post()
    async create(@Body() dto: CreateBookingDto, @Req() req: any) {
        const userId = req.user?.id;
        const startAt = new Date(dto.startAt);

        const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
        return this.createBooking.execute(new CreateBookingCommand(userId, dto.roomId, startAt, endAt));
    }

    @Post('confirm')
    async confirm(@Body() dto: ConfirmBookingDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.confirmBooking.execute(new ConfirmBookingCommand(userId, dto.bookingId));
    }
}