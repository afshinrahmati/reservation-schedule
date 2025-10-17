import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisLockService } from '@/core/booking/infrastructure/redis/redis-lock.service';



import { EVENT_BUS } from '@/core/_port/common/event-bus.port';
import {Room} from "@/core/booking/domain/models/room.entity";
import {Booking} from "@/core/booking/domain/models/booking.entity";
import {ROOM_REPOSITORY} from "@/core/booking/domain/repository/roomRepository.interface";
import {RoomTypeOrmRepository} from "@/core/booking/infrastructure/repository/room.repository";
import {BOOKING_REPOSITORY} from "@/core/booking/domain/repository/bookingRepository.inteface";
import {BookingTypeOrmRepository} from "@/core/booking/infrastructure/repository/booking.repository";
import {RabbitMqEventBusAdapter} from "@/infrastructure/eventbus/rabbitmq-event-bus.adapter";
import {CreateRoomHandler} from "@/core/booking/application/create-room.handler";
import {CreateBookingHandler} from "@/core/booking/application/create-booking.handler";
import {ConfirmBookingHandler} from "@/core/booking/application/confirm-booking.handler";
import {RoomController} from "@/userInterfaces/rest/modules/api/booking/room.controller";
import {BookingController} from "@/userInterfaces/rest/modules/api/booking/booking.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Room, Booking])],
    controllers: [RoomController, BookingController],
    providers: [
        { provide: ROOM_REPOSITORY, useClass: RoomTypeOrmRepository },
        { provide: BOOKING_REPOSITORY, useClass: BookingTypeOrmRepository },
        { provide: EVENT_BUS, useClass: RabbitMqEventBusAdapter },
        RedisLockService,
        CreateRoomHandler,
        CreateBookingHandler,
        ConfirmBookingHandler,
    ],
})
export class BookingModule {}