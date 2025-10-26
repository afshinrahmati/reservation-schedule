import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NotificationLoggerRepo } from '../../infrastructure/notification-logger.repo';
import { EventBusPort } from '@/core/_shared/application/ports/event-bus.port';
import { SmsService } from '../../infrastructure/sms.service';
import { MailerService } from '../../infrastructure/mailer.service';

@Injectable()
export class IdentityEventsSubscriber implements OnModuleInit {
  constructor(
    private bus: EventBusPort,
    private logRepo: NotificationLoggerRepo,
    private email: MailerService,
    private sms: SmsService,
    private ds: DataSource,
  ) {}

  async onModuleInit() {
    await this.bus.subscribe('identity.user.registered', async (evt) => {
      const email = await this.getUserEmail(evt.userId);
      try {
        await this.email.sendMail(
          email,
          'خوش آمدید',
          'ثبت‌نام شما با موفقیت انجام شد.',
        );
        // await this.logRepo.log({ userId: evt.userId, channel: 'email', template: 'user_registered', payload: { email }, success: true });
        await this.sms.sendSms('', 'ثبت‌نام شما انجام شد.');
        // await this.logRepo.log({ userId: evt.userId, channel: 'sms', template: 'user_registered', payload: {}, success: true });
      } catch (e: any) {
        await this.logRepo.log({
          userId: evt.userId,
          channel: 'email',
          template: 'user_registered',
          payload: { email },
          success: false,
          error: String(e),
        });
      }
    });

    await this.bus.subscribe('identity.user.logged_in', async (evt) => {
      const email = await this.getUserEmail(evt.userId);
      await this.email.sendMail(
        email,
        'خوش آمدید',
        'وارد شما با موفقیت انجام شد.',
      );

      // await this.logRepo.log({ userId: evt.userId, channel: 'email', template: 'user_logged_in', payload: { email }, success: true });
    });
  }

  private async getUserEmail(userId: string) {
    const r = await this.ds.query(`SELECT email FROM users WHERE id=$1`, [
      userId,
    ]);
    return r?.[0]?.email ?? '';
  }
}
