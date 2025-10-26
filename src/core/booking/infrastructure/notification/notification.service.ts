import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NotificationPort } from '@/core/booking/application/ports/notification.port';
import { NotificationLoggerRepo } from '@/core/notification/infrastructure/notification-logger.repo';
import { MailerService } from '@/core/notification/infrastructure/mailer.service';
import { SmsService } from '@/core/notification/infrastructure/sms.service';

@Injectable()
export class BookingNotificationAdapter implements NotificationPort {
  constructor(
    private readonly ds: DataSource,
    private readonly email: MailerService,
    private readonly sms: SmsService,
    private readonly logger: NotificationLoggerRepo,
  ) {}

  async sendBookingCreated(
    userId: string,
    bookingId: string,
    expiresInSec: number,
  ): Promise<void> {
    const { email, phone } = await this.getUserContact(userId);
    try {
      await this.email.sendMail(
        email,
        'رزرو موقت ایجاد شد',
        `رزرو شما ایجاد شد. تا ${expiresInSec} ثانیه فرصت پرداخت دارید.`,
      );
      // await this.logger.log({ userId, channel: 'email', template: 'booking_created', payload: { bookingId, expiresInSec }, success: true });
    } catch (e: any) {
      // await this.logger.log({ userId, channel: 'email', template: 'booking_created', payload: { bookingId, expiresInSec }, success: false, error: String(e) });
    }

    if (phone) {
      await this.sms.sendSms(
        phone,
        `رزرو ایجاد شد. ${Math.floor(expiresInSec / 60)} دقیقه فرصت پرداخت دارید.`,
      );
      // await this.logger.log({ userId, channel: 'sms', template: 'booking_created', payload: { bookingId }, success: true });
    }
  }

  async sendBookingConfirmed(userId: string, bookingId: string): Promise<void> {
    const { email, phone } = await this.getUserContact(userId);
    await this.email.sendMail(
      email,
      'رزرو تایید شد',
      `رزرو ${bookingId} تایید شد.`,
    );
    await this.logger.log({
      userId,
      channel: 'email',
      template: 'booking_confirmed',
      payload: { bookingId },
      success: true,
    });
    if (phone) {
      await this.sms.sendSms(phone, `رزرو ${bookingId} تایید شد.`);
      await this.logger.log({
        userId,
        channel: 'sms',
        template: 'booking_confirmed',
        payload: { bookingId },
        success: true,
      });
    }
  }

  async sendPaymentExpired(userId: string, bookingId: string): Promise<void> {
    const { email, phone } = await this.getUserContact(userId);
    await this.email.sendMail(
      email,
      'لغو به‌علت عدم پرداخت',
      `رزرو ${bookingId} به دلیل عدم پرداخت لغو شد.`,
    );
    await this.logger.log({
      userId,
      channel: 'email',
      template: 'payment_expired',
      payload: { bookingId },
      success: true,
    });
    if (phone) {
      await this.sms.sendSms(
        phone,
        `رزرو ${bookingId} به دلیل عدم پرداخت لغو شد.`,
      );
      await this.logger.log({
        userId,
        channel: 'sms',
        template: 'payment_expired',
        payload: { bookingId },
        success: true,
      });
    }
  }

  private async getUserContact(userId: string) {
    const r = await this.ds.query(`SELECT email FROM users WHERE id=$1`, [
      userId,
    ]);
    return { email: r?.[0]?.email ?? '', phone: '' };
  }
}

// import { Injectable } from '@nestjs/common';
// import { NotificationPort } from '@/core/booking/application/ports/notification.port';
//
// @Injectable()
// export class BookingNotificationAdapter implements NotificationPort {
//     async sendBookingCreated(userId: string, bookingId: string, expiresInSec: number) {
//         console.log('[notify] booking_created', { userId, bookingId, expiresInSec });
//     }
//     async sendBookingConfirmed(userId: string, bookingId: string) {
//         console.log('[notify] booking_confirmed', { userId, bookingId });
//     }
//     async sendPaymentExpired(userId: string, bookingId: string) {
//         console.log('[notify] payment_expired', { userId, bookingId });
//     }
// }