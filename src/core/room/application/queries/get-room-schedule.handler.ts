import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient } from 'redis';
import { RoomEntity } from '@/core/room/domain/models/room.entity';
import { BookingEntity } from '@/core/booking/domain/models/booking.entity';
import { BookingStatus } from '@/core/booking/domain/enums/booking-status.enum';
import { GetRoomDailyScheduleQuery } from '@/core/room/application/queries/get-room-schedule.query';

type DayStatus = 'FREE' | 'HELD' | 'BOOKED';

@QueryHandler(GetRoomDailyScheduleQuery)
export class GetRoomDailyScheduleHandler
  implements IQueryHandler<GetRoomDailyScheduleQuery>
{
  constructor(
    @InjectRepository(RoomEntity) private rooms: Repository<RoomEntity>,
    @InjectRepository(BookingEntity)
    private bookings: Repository<BookingEntity>,
  ) {}

  async execute(q: GetRoomDailyScheduleQuery) {
    const cleanedRoomId = String(q.roomId).replace(/\/+$/, '');
    const room = await this.rooms.findOne({ where: { id: cleanedRoomId } });
    if (!room) return { roomId: cleanedRoomId, days: [] };

    const from = new Date(
      Date.UTC(
        q.fromDate.getUTCFullYear(),
        q.fromDate.getUTCMonth(),
        q.fromDate.getUTCDate(),
      ),
    );
    const to = new Date(from);
    to.setUTCDate(from.getUTCDate() + q.days);

    const db = await this.bookings
      .createQueryBuilder('b')
      .where('b.room_id = :roomId', { roomId: cleanedRoomId })
      .andWhere('b.status = :st', { st: BookingStatus.CONFIRMED })
      .andWhere('b.start_at < :to AND b.end_at > :from', { from, to })
      .select(['b.id', 'b.startAt', 'b.endAt', 'b.status'])
      .getMany();

    const redis = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      database: Number(process.env.REDIS_DB || 0),
    });
    await redis.connect();

    const heldRanges: Array<{ start: Date; end: Date; src: 'HOLD' | 'LOCK' }> =
      [];

    for await (const k of redis.scanIterator({
      MATCH: `hold:room:${cleanedRoomId}:*`,
      COUNT: 200,
    })) {
      const key = String(k);
      const val = await redis.get(key);
      if (!val) continue;
      try {
        const parsed = JSON.parse(val);
        const s = new Date(parsed.startAt);
        const e = new Date(parsed.endAt);
        if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
          if (s < to && e > from)
            heldRanges.push({ start: s, end: e, src: 'HOLD' });
        }
      } catch {}
    }

    for await (const k of redis.scanIterator({
      MATCH: `lock:room:${cleanedRoomId}:*`,
      COUNT: 200,
    })) {
      const parts = String(k).split(':');
      const tail = parts.slice(3);
      if (tail.length === 1) {
        const start = new Date(tail[0]);
        if (Number.isNaN(start.getTime())) continue;
        const end = new Date(
          start.getTime() + (room.slotDurationMin ?? 15) * 60_000,
        );
        if (start < to && end > from)
          heldRanges.push({ start, end, src: 'LOCK' });
      } else if (tail.length >= 2) {
        const ci = new Date(tail[tail.length - 2]);
        const co = new Date(tail[tail.length - 1]);
        if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) continue;
        if (ci < to && co > from)
          heldRanges.push({ start: ci, end: co, src: 'LOCK' });
      }
    }

    await redis.quit();

    const days: Array<{ date: string; status: DayStatus }> = [];
    for (let i = 0; i < q.days; i++) {
      const dayStart = new Date(from);
      dayStart.setUTCDate(from.getUTCDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayStart.getUTCDate() + 1);

      const isBooked = db.some((b) => b.startAt < dayEnd && b.endAt > dayStart);
      const isHeld = heldRanges.some(
        (r) => r.start < dayEnd && r.end > dayStart,
      );

      const status: DayStatus = isBooked ? 'BOOKED' : isHeld ? 'HELD' : 'FREE';
      days.push({ date: dayStart.toISOString().slice(0, 10), status });
    }

    return {
      roomId: room.id,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      days,
    };
  }
}
