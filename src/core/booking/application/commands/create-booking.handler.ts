import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import {CreateBookingCommand} from "./create-booking.command";
import {EventBusPort} from "../../../_shared/application/ports/event-bus.port";
import {BookingRepoPort} from "../ports/booking-repo.port";
import {LockPort} from "../ports/lock.port";
import { ErrorCodes } from '@/core/_shared/errors/error-codes';
import { err } from '@/core/_shared/errors/factory';
import {BookingStatus} from "../../domain/enums/booking-status.enum";
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
    constructor(private ds:DataSource, private lock:LockPort, private repo:BookingRepoPort, private bus:EventBusPort) {}
    async execute({ userId, dto }: CreateBookingCommand) {
        const start = new Date(dto.startAt); const end = new Date(start.getTime() + dto.slotDurationMin*60000);
        const ttl = Number(process.env.PAYMENT_TTL_SEC || 900);
        const lockKey = `lock:room:${dto.roomId}:${start.toISOString()}`;
        const lockVal = randomUUID();
        const acquired = await this.lock.acquire(lockKey, lockVal, ttl);
        if (!acquired) throw err.conflict(ErrorCodes.BOOKING.SLOT_TAKEN, 'این بازه زمانی قبلاً رزرو شده');

        const booking = await this.ds.transaction(async em => {
            return this.repo.save({ roomId: dto.roomId, userId, startAt: start, endAt: end, status: BookingStatus.PENDING });
        });

        const { createClient } = await import('redis');
        const redis = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
        await redis.connect();
        await redis.set(`hold:booking:${booking.id}`, JSON.stringify({ userId, roomId: dto.roomId }), { EX: ttl });
        await redis.quit();

        await this.bus.publish('booking.created', { bookingId: booking.id, roomId: dto.roomId, userId, startAt: start.toISOString(), endAt: end.toISOString(), expiresInSec: ttl });
        await this.bus.publish('booking.payment_window.started', { bookingId: booking.id, userId, ttlSec: ttl });

        return { bookingId: booking.id, expiresIn: ttl };
    }
}