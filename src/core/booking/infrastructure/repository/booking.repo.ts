import { Injectable } from '@nestjs/common'; import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; import { BookingRepoPort } from '../../application/ports/booking-repo.port';
import { BookingEntity } from '../../domain/models/booking.entity';
@Injectable()
export class TypeOrmBookingRepo implements BookingRepoPort {
    constructor(@InjectRepository(BookingEntity) private repo: Repository<BookingEntity>) {}
    save(b: Partial<BookingEntity>) { return this.repo.save(b); }
    findById(id: string) { return this.repo.findOne({ where: { id } }); }
}