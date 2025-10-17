import { BookingStatus } from '../enums/booking-status.enum';

export class BookingModel {
    constructor(
        public readonly id: string,
        public roomId: string,
        public userId: string,
        public startAt: Date,
        public endAt: Date,
        public status: BookingStatus = BookingStatus.PENDING,
        public createdAt: Date = new Date(),
    ) {}

    confirm() {
        if (this.status !== BookingStatus.PENDING)
            throw new Error('Only pending bookings can be confirmed');
        this.status = BookingStatus.CONFIRMED;
    }

    cancel() {
        if (this.status === BookingStatus.CONFIRMED)
            throw new Error('Cannot cancel confirmed booking');
        this.status = BookingStatus.CANCELLED;
    }

    expire() {
        if (this.status !== BookingStatus.PENDING)
            throw new Error('Cannot expire non-pending booking');
        this.status = BookingStatus.EXPIRED;
    }
}