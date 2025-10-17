import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BookingModel } from '@/core/booking/domain/models/booking.model';
import { BookingStatus } from '@/core/booking/domain/enums/booking-status.enum';
import { RedisLockService } from '@/core/booking/infrastructure/redis/redis-lock.service';
import * as eventInterface from '@/core/_port/common/event-bus.port';
import * as bookingRepositoryInterface from "@/core/booking/domain/repository/bookingRepository.inteface";
import * as roomRepositoryInterface from "@/core/booking/domain/repository/roomRepository.interface";
import {CreateBookingCommand} from "@/core/booking/application/create-booking.command";

class BookingCreatedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly roomId: string,
        public readonly userId: string,
        public readonly startAt: string,
        public readonly endAt: string,
    ) {
    }
}

@Injectable()
export class CreateBookingHandler {
    private readonly TTL = 15 * 60;

    constructor(
        @Inject(bookingRepositoryInterface.BOOKING_REPOSITORY) private readonly bookings: bookingRepositoryInterface.BookingRepositoryPort,
        @Inject(roomRepositoryInterface.ROOM_REPOSITORY) private readonly rooms: roomRepositoryInterface.RoomRepositoryPort,
        private readonly redisLock: RedisLockService,
        @Inject(eventInterface.EVENT_BUS) private readonly eventBus: eventInterface.EventBusPort,
    ) {}

    async execute(cmd: CreateBookingCommand) {
        const room = await this.rooms.findById(cmd.roomId);
        if (!room) throw new BadRequestException('Room not found');

        // check overlaps
        const conflicts = await this.bookings.findByRoomAndInterval(cmd.roomId, cmd.startAt, cmd.endAt);
        if (conflicts.length) throw new BadRequestException('Time slot not available');

        // redis lock (resourceId + timeslot → lock)
        const lockKey = `lock:room:${cmd.roomId}:${cmd.startAt.toISOString()}`;
        const locked = await this.redisLock.lock(lockKey, cmd.userId, this.TTL);
        if (!locked) throw new BadRequestException('Time slot already locked');

        const booking = new BookingModel(randomUUID(), cmd.roomId, cmd.userId, cmd.startAt, cmd.endAt, BookingStatus.PENDING);
        const saved = await this.bookings.save(booking);
        await this.eventBus.publish(new BookingCreatedEvent(
            saved.id, saved.roomId, saved.userId, saved.startAt.toISOString(), saved.endAt.toISOString(),
        ));

        return { bookingId: saved.id, status: saved.status, holdExpiresIn: '15m' };
    }
}