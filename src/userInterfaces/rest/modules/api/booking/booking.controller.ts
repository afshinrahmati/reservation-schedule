import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from '@/core/booking/application/dto/create-booking.dto';
import { CreateBookingCommand } from '@/core/booking/application/commands/create-booking.command';
import { ConfirmBookingCommand } from '@/core/booking/application/commands/confirm-booking.command';
import {ConfirmBookingDto} from "@/core/booking/application/dto/confirm-booking.dto";
import {JwtStrategy} from "@/core/_shared/security/jwt.strategy";
@UseGuards(JwtStrategy)
@ApiBearerAuth() @ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
    constructor(private cmd: CommandBus) {}
    @Post() create(@Body() dto: CreateBookingDto, @Req() req){ return this.cmd.execute(new CreateBookingCommand(req.user.id, dto)); }
    @Post('confirm') confirm(@Body() dto: ConfirmBookingDto, @Req() req){ return this.cmd.execute(new ConfirmBookingCommand(req.user.id, dto.bookingId)); }
}