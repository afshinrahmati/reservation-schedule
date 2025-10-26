import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '../../infrastructure/mailer.service';
import { SmsService } from '../../infrastructure/sms.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly sms: SmsService,
  ) {}

  async handleEvent(event: any) {
    this.logger.log(`📨 Handling event: ${event.type}`);

    switch (event.type) {
      case 'UserRegisteredEvent':
        await this.userRegistered(event.data);
        break;

      case 'UserLoggedInEvent':
        await this.userLoggedIn(event.data);
        break;

      default:
        this.logger.warn(`⚠️ Unknown event type: ${event.type}`);
    }
  }

  private async userRegistered(data: any) {
    this.logger.log(`👋 Sending welcome notifications to ${data.email}`);
    await Promise.allSettled([
      this.mailer.sendMail(data.email, 'Welcome!', 'Your account was created.'),
      this.sms.sendSms(data.email, 'Welcome to our platform!'),
    ]);
  }

  private async userLoggedIn(data: any) {
    this.logger.log(`🔑 Sending login alert to ${data.email}`);
    await Promise.allSettled([
      this.mailer.sendMail(
        data.email,
        'Login Alert',
        'You logged in successfully.',
      ),
      this.sms.sendSms(data.email, 'You just logged in to your account.'),
    ]);
  }
}
