import { Booking } from '@/core/booking/domain/models/booking.entity';
import { BookingStatus } from '@/core/booking/domain/enums/booking-status.enum';

export interface BookingRepositoryPort {
    save(booking: Booking): Promise<Booking>;
    findById(id: string): Promise<Booking | null>;
    findByRoomAndInterval(roomId: string, startAt: Date, endAt: Date): Promise<Booking[]>;
    updateStatus(id: string, status: BookingStatus): Promise<void>;
    findUserBookings(userId: string): Promise<Booking[]>;
}
export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');