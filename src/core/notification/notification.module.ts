import { Module } from '@nestjs/common';
import { IdentityEventsSubscriber } from './application/subscribers/identity-events.subscriber';
import { NotificationLoggerRepo } from './infrastructure/notification-logger.repo';
import { SmsService } from './infrastructure/sms.service';
import { MailerService } from './infrastructure/mailer.service';
import { EventBusModule } from '@/infrastructure/eventbus/event-bus.module';

@Module({
      imports: [EventBusModule],

    providers: [IdentityEventsSubscriber, NotificationLoggerRepo, MailerService, SmsService],
})
export class NotificationModule { }