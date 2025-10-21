import { Module } from '@nestjs/common'; import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm'; import { RoomEntity } from './domain/models/room.entity';
import {RoomRepoPort} from "@/core/room/application/ports/room-repo.port";
import {TypeOrmRoomRepo} from "@/core/room/infrastructure/repository/room.repo";
import {ListMyRoomsHandler} from "@/core/room/application/queries/list-my-rooms.handler";
import {UpdateRoomHandler} from "@/core/room/application/command/update-room.handler";
import {CreateRoomHandler} from "@/core/room/application/command/create-room.handler";
import {RoomController} from "@/userInterfaces/rest/modules/api/room/room.controller";
@Module({
    imports:[CqrsModule,TypeOrmModule.forFeature([RoomEntity])],
    controllers:[RoomController],
    providers:[
        { provide: RoomRepoPort, useClass: TypeOrmRoomRepo },
        CreateRoomHandler, UpdateRoomHandler, ListMyRoomsHandler,
    ],
    exports:[RoomRepoPort],
})
export class RoomModule {}