import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './domain/models/booking.entity';
import { BookingRepoPort } from './application/ports/booking-repo.port';
import { NotificationModule } from '@/core/notification/notification.module';
import { TypeOrmBookingRepo } from '@/core/booking/infrastructure/repository/booking.repo';
import { RedisLockAdapter } from '@/core/booking/infrastructure/redis/redis-lock.service';
import { NotificationPort } from '@/core/booking/application/ports/notification.port';
import { BookingNotificationAdapter } from '@/core/booking/infrastructure/notification/notification.service';
import { CreateBookingHandler } from '@/core/booking/application/commands/create-booking.handler';
import { ConfirmBookingHandler } from '@/core/booking/application/commands/confirm-booking.handler';
import { MailerService } from '@/core/notification/infrastructure/mailer.service';
import { SmsService } from '@/core/notification/infrastructure/sms.service';
import { NotificationLoggerRepo } from '@/core/notification/infrastructure/notification-logger.repo';
import { BookingController } from '@/userInterfaces/rest/modules/api/booking/booking.controller';
import { RoomModule } from '@/core/room/room.module';
import { LockPort } from '@/core/booking/application/ports/lock.port';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BookingEntity]),
    NotificationModule,
    RoomModule,
  ],
  controllers: [BookingController],
  providers: [
    { provide: BookingRepoPort, useClass: TypeOrmBookingRepo },
    { provide: LockPort, useClass: RedisLockAdapter },
    { provide: NotificationPort, useClass: BookingNotificationAdapter },
    CreateBookingHandler,
    ConfirmBookingHandler,
    MailerService,
    SmsService,
    NotificationLoggerRepo,
  ],
})
export class BookingModule {}
