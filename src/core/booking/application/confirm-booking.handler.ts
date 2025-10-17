import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { RedisLockService } from '@/core/booking/infrastructure/redis/redis-lock.service';
import { BookingStatus } from '@/core/booking/domain/enums/booking-status.enum';
import * as eventInterface from '@/core/_port/common/event-bus.port';
import * as bookingRepositoryInterface from "@/core/booking/domain/repository/bookingRepository.inteface";
import {ConfirmBookingCommand} from "@/core/booking/application/confirm-booking.command";

class BookingConfirmedEvent {
    constructor(public readonly bookingId: string) {}
}

@Injectable()
export class ConfirmBookingHandler {
    constructor(
        @Inject(bookingRepositoryInterface.BOOKING_REPOSITORY) private readonly bookings: bookingRepositoryInterface.BookingRepositoryPort,
        private readonly redis: RedisLockService,
        @Inject(eventInterface.EVENT_BUS) private readonly eventBus: eventInterface.EventBusPort,
    ) {}

    async execute(cmd: ConfirmBookingCommand) {
        const booking = await this.bookings.findById(cmd.bookingId);
        if (!booking) throw new BadRequestException('Booking not found');
        if (booking.userId !== cmd.userId) throw new ForbiddenException();

        if (booking.status !== BookingStatus.PENDING) {
            throw new BadRequestException('Booking not pending');
        }

        const lockKey = `lock:room:${booking.roomId}:${booking.startAt.toISOString()}`;
        await this.redis.unlock(lockKey).catch(() => null);

        await this.bookings.updateStatus(booking.id, BookingStatus.CONFIRMED);

        await this.eventBus.publish(new BookingConfirmedEvent(booking.id));

        return { bookingId: booking.id, status: BookingStatus.CONFIRMED };
    }
}