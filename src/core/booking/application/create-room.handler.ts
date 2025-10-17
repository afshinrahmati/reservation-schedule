import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RoomModel } from '@/core/booking/domain/models/room.model';
import {ROOM_REPOSITORY, RoomRepositoryPort} from "@/core/booking/domain/repository/roomRepository.interface";
import {CreateRoomCommand} from "@/core/booking/application/create-room.command";

@Injectable()
export class CreateRoomHandler {
    constructor(@Inject(ROOM_REPOSITORY) private readonly rooms: any) {}

    async execute(cmd: CreateRoomCommand) {
        if (!cmd.ownerId) throw new ForbiddenException();
        const room = new RoomModel(randomUUID(), cmd.ownerId, cmd.name, cmd.slotDurationMinutes);
        return this.rooms.save(room);
    }
}