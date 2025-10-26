import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './domain/models/room.entity';
import { RoomRepoPort } from '@/core/room/application/ports/room-repo.port';
import { TypeOrmRoomRepoAdapter } from '@/core/room/infrastructure/repository/room.repo';
import { ListMyRoomsHandler } from '@/core/room/application/queries/list-my-rooms.handler';
import { UpdateRoomHandler } from '@/core/room/application/command/update-room.handler';
import { CreateRoomHandler } from '@/core/room/application/command/create-room.handler';
import { RoomController } from '@/userInterfaces/rest/modules/api/room/room.controller';

import { GetRoomDailyScheduleHandler } from './application/queries/get-room-schedule.handler';
import { BookingEntity } from '../booking/domain/models/booking.entity';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([RoomEntity, BookingEntity])],
  controllers: [RoomController],
  providers: [
    TypeOrmRoomRepoAdapter,
    { provide: RoomRepoPort, useClass: TypeOrmRoomRepoAdapter },

    CreateRoomHandler,
    UpdateRoomHandler,
    ListMyRoomsHandler,
    GetRoomDailyScheduleHandler,
  ],
  exports: [
    RoomRepoPort,
    { provide: RoomRepoPort, useClass: TypeOrmRoomRepoAdapter },
    TypeOrmModule,
  ],
})
export class RoomModule {}
