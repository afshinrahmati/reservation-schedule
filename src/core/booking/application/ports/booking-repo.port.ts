import { BookingEntity } from '../../domain/models/booking.entity';
export abstract class BookingRepoPort {
    abstract save(b: Partial<BookingEntity>): Promise<BookingEntity>;
    abstract findById(id: string): Promise<BookingEntity | null>;
}