import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from '@/core/booking/domain/models/booking.entity';
import { BookingModel } from '@/core/booking/domain/models/booking.model';
import { BookingStatus } from '@/core/booking/domain/enums/booking-status.enum';
import {BookingRepositoryPort} from "@/core/booking/domain/repository/bookingRepository.inteface";

@Injectable()
export class BookingTypeOrmRepository implements BookingRepositoryPort {
    constructor(@InjectRepository(Booking) private readonly repo: Repository<Booking>) {}

    async save(b: BookingModel): Promise<BookingModel> {
        const row = this.repo.create(b);
        const saved = await this.repo.save(row);
        return new BookingModel(saved.id, saved.roomId, saved.userId, saved.startAt, saved.endAt, saved.status, saved.createdAt);
    }

    async findById(id: string): Promise<BookingModel | null> {
        const r = await this.repo.findOne({ where: { id } });
        return r ? new BookingModel(r.id, r.roomId, r.userId, r.startAt, r.endAt, r.status, r.createdAt) : null;
    }

    async findByRoomAndInterval(roomId: string, startAt: Date, endAt: Date): Promise<BookingModel[]> {
        const qb = this.repo.createQueryBuilder('b')
            .where('b.roomId = :roomId', { roomId })
            .andWhere('b.startAt < :endAt', { endAt })
            .andWhere('b.endAt > :startAt', { startAt })
            .andWhere('b.status IN (:...active)', { active: [BookingStatus.PENDING, BookingStatus.CONFIRMED] });
        const rows = await qb.getMany();
        return rows.map(r => new BookingModel(r.id, r.roomId, r.userId, r.startAt, r.endAt, r.status, r.createdAt));
    }

    async updateStatus(id: string, status: BookingStatus): Promise<void> {
        await this.repo.update({ id }, { status });
    }

    async findUserBookings(userId: string): Promise<BookingModel[]> {
        const rows = await this.repo.find({ where: { userId } });
        return rows.map(r => new BookingModel(r.id, r.roomId, r.userId, r.startAt, r.endAt, r.status, r.createdAt));
    }
}