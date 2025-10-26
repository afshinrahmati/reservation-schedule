import { RoomRepoPort } from '@/core/room/application/ports/room-repo.port';
import { ErrorCodes } from '@/core/_shared/errors/error-codes';
import { err } from '@/core/_shared/errors/factory';
import { randomUUID } from 'crypto';
import { createClient } from 'redis';
import { CreateBookingCommand } from '@/core/booking/application/commands/create-booking.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { LockPort } from '@/core/booking/application/ports/lock.port';
import { BookingRepoPort } from '@/core/booking/application/ports/booking-repo.port';
import { EventBusPort } from '@/core/_shared/application/ports/event-bus.port';
import { Inject } from '@nestjs/common';
import { makeHoldToken } from '@/core/_shared/security/token.util';
import { BookingEntity } from '@/core/booking/domain/models/booking.entity';
import { BookingStatus } from '@/core/booking/domain/enums/booking-status.enum';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler
  implements ICommandHandler<CreateBookingCommand>
{
  constructor(
    private ds: DataSource,
    private lock: LockPort,
    private repo: BookingRepoPort,
    private bus: EventBusPort,
    @Inject(RoomRepoPort) private readonly rooms: RoomRepoPort,
  ) {}

  async execute({ userId, dto }: CreateBookingCommand) {
    const roomId = String(dto.roomId).replace(/\/+$/, '');
    const room = await this.rooms.findById(roomId);
    if (!room) throw err.notFound(ErrorCodes.ROOM.NOT_FOUND, 'اتاق یافت نشد');

    const slotMin = room.slotDurationMin;
    if (!slotMin || slotMin <= 0)
      throw err.badRequest(
        ErrorCodes.ROOM.INVALID_SLOT,
        'پیکربندی اسلات نامعتبر است',
      );

    const start = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(dto.startAt)
        ? `${dto.startAt}T00:00:00.000Z`
        : dto.startAt,
    );
    if (Number.isNaN(start.getTime()))
      throw err.badRequest(ErrorCodes.BOOKING.BAD_START, 'startAt نامعتبر است');
    if (start.getTime() < Date.now() - 1000)
      throw err.badRequest(ErrorCodes.BOOKING.PAST_SLOT, 'شروع در گذشته است');
    if (
      start.getUTCMinutes() % slotMin !== 0 ||
      start.getUTCSeconds() !== 0 ||
      start.getUTCMilliseconds() !== 0
    ) {
      throw err.badRequest(
        ErrorCodes.BOOKING.MISALIGNED_SLOT,
        `شروع باید روی مضرب ${slotMin} دقیقه باشد`,
      );
    }
    const booking = await this.ds
      .transaction(async (em) => {
        return await em.getRepository(BookingEntity).save({
          roomId: roomId,
          userId,
          startAt: new Date(dto.startAt),
          status: BookingStatus.CONFIRMED,
        });
      })
      .catch(() => {
        throw err.conflict(
          ErrorCodes.BOOKING.SLOT_TAKEN,
          'این بازه قبلاً رزرو شده',
        );
      });

    const end = new Date(start.getTime() + slotMin * 60_000);
    const ttl = Number(process.env.PAYMENT_TTL_SEC || 900);

    const lockKey = `lock:room:${roomId}:${start.toISOString()}`;
    const acquired = await this.lock.acquire(lockKey, randomUUID(), ttl);
    if (!acquired)
      throw err.conflict(
        ErrorCodes.BOOKING.SLOT_TAKEN,
        'این بازه قبلاً رزرو شده',
      );

    const token = makeHoldToken(roomId, start.toISOString(), userId);

    const redis = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    });

    try {
      await redis.connect();
      await redis.set(
        `hold:token:${token}`,
        JSON.stringify({
          userId,
          roomId,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
        }),
        { EX: ttl },
      );
    } finally {
      try {
        await redis.quit();
      } catch {}
    }

    return {
      token,
      roomId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      expiresIn: ttl,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };
  }
}
