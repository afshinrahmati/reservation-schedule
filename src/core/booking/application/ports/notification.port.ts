export abstract class NotificationPort {
    abstract sendBookingCreated(userId: string, bookingId: string, expiresInSec: number): Promise<void>;
    abstract sendBookingConfirmed(userId: string, bookingId: string): Promise<void>;
    abstract sendPaymentExpired(userId: string, bookingId: string): Promise<void>;
}