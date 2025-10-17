import { Module, OnModuleInit } from '@nestjs/common';
import { MailerService } from './infrastructure/mailer.service';
import { SmsService } from './infrastructure/sms.service';
import {NotificationService} from "@/core/notification/domain/services/notification.service";
import {RabbitMqListener} from "@/core/notification/infrastructure/rabbitmq-listener.service";

@Module({
    providers: [NotificationService, RabbitMqListener, MailerService, SmsService],
})
export class NotificationModule implements OnModuleInit {
    constructor(private readonly listener: RabbitMqListener) {}
    async onModuleInit() {
        await this.listener.start();
    }
}