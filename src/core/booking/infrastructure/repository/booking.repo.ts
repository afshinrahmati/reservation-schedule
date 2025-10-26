import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  BookingRepoPort,
  BookingSearchFilter,
  BookingSearchResult,
  BookingSearchScope,
} from '../../application/ports/booking-repo.port';
import { BookingEntity } from '../../domain/models/booking.entity';
import { RoomEntity } from '@/core/room/domain/models/room.entity';

@Injectable()
export class TypeOrmBookingRepo implements BookingRepoPort {
  constructor(
    @InjectRepository(BookingEntity) private repo: Repository<BookingEntity>,
  ) {}
  save(b: Partial<BookingEntity>) {
    return this.repo.save(b);
  }
  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  async search(
    scope: BookingSearchScope,
    f: BookingSearchFilter,
  ): Promise<BookingSearchResult> {
    const page = Math.max(1, Number(f.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(f.pageSize ?? 20)));

    let qb: SelectQueryBuilder<BookingEntity> = this.repo
      .createQueryBuilder('b')
      .leftJoin(RoomEntity, 'r', 'r.id = b.room_id')
      .select([
        'b.id AS id',
        'b.room_id AS "roomId"',
        'b.user_id AS "userId"',
        'b.start_at AS "startAt"',
        'b.end_at AS "endAt"',
        'b.status AS status',
        'r.name AS "roomName"',
        'r.owner_id AS "ownerId"',
      ])
      .where('b.status = :st', { st: 'CONFIRMED' });

    if (scope.kind === 'USER') {
      qb = qb.andWhere('b.user_id = :uid', { uid: scope.userId });
    } else if (scope.kind === 'HOST') {
      qb = qb.andWhere('r.owner_id = :oid', { oid: scope.ownerId });
    }

    if (f.roomId) qb = qb.andWhere('b.room_id = :rid', { rid: f.roomId });
    if (f.userId && scope.kind === 'ADMIN')
      qb = qb.andWhere('b.user_id = :fuid', { fuid: f.userId });
    if (f.dateFrom) qb = qb.andWhere('b.start_at >= :df', { df: f.dateFrom });
    if (f.dateTo) qb = qb.andWhere('b.end_at   <= :dt', { dt: f.dateTo });

    qb = qb.orderBy('b.start_at', 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getRawMany();

    const mapped = items.map((r) => ({
      id: r.id,
      roomId: r.roomId,
      userId: r.userId,
      startAt: new Date(r.startAt),
      endAt: new Date(r.endAt),
      status: 'CONFIRMED' as const,
      roomName: r.roomName,
    }));

    return { items: mapped, page, pageSize, total };
  }
}
