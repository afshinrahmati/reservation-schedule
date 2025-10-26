import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBusPort } from '@/core/_shared/application/ports/event-bus.port';
import { BookingRepoPort } from '../ports/booking-repo.port';
import { DataSource } from 'typeorm';
import { ErrorCodes } from '@/core/_shared/errors/error-codes';
import { err } from '@/core/_shared/errors/factory';
import { ConfirmCommand } from '@/core/booking/application/commands/confirm-booking.command';
import { createClient } from 'redis';
import { BookingEntity } from '@/core/booking/domain/models/booking.entity';
import { NotificationPort } from '@/core/booking/application/ports/notification.port';
import { BookingStatus } from '../../domain/enums/booking-status.enum';

@CommandHandler(ConfirmCommand)
export class ConfirmBookingHandler implements ICommandHandler<ConfirmCommand> {
  constructor(
    private ds: DataSource,
    private repo: BookingRepoPort,
    private bus: EventBusPort,
    private readonly notification: NotificationPort,
  ) {}
  async execute({ userId, token }: ConfirmCommand) {
    if (!token)
      throw err.badRequest(ErrorCodes.REQUEST.BAD_PARAMS, 'توکن الزامی است');

    const redis = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    });
    let hold: any;
    try {
      await redis.connect();
      const raw = await redis.get(`hold:token:${token}`);
      if (!raw)
        throw err.badRequest(
          ErrorCodes.BOOKING.EXPIRED,
          'هلد یافت نشد/منقضی شده است',
        );

      try {
        hold = JSON.parse(raw);
      } catch {
        throw err.badRequest(ErrorCodes.REQUEST.PARSE_ERROR, 'هلد خراب است');
      }

      if (hold.userId !== userId)
        throw err.forbidden(ErrorCodes.AUTH.FORBIDDEN, 'اجازه دسترسی ندارید');

      const booking = await this.ds
        .transaction(async (em) => {
          return await em.getRepository(BookingEntity).save({
            roomId: hold.roomId,
            userId,
            startAt: new Date(hold.startAt),
            endAt: new Date(hold.endAt),
            status: BookingStatus.CONFIRMED,
          });
        })
        .catch(() => {
          throw err.conflict(
            ErrorCodes.BOOKING.SLOT_TAKEN,
            'این بازه قبلاً رزرو شده',
          );
        });

      await redis.del(`hold:token:${token}`);
      await redis.del(`lock:room:${hold.roomId}:${hold.startAt}`);

      await this.notification.sendBookingConfirmed(userId, booking.id);

      return { bookingId: booking.id, status: BookingStatus.CONFIRMED };
    } finally {
      try {
        await redis.quit();
      } catch {}
    }
  }
}
