import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {UpdateRoomCommand} from "@/core/room/application/command/update-room.command";
import {RoomRepoPort} from "@/core/room/application/ports/room-repo.port";
import { ErrorCodes } from '@/core/_shared/errors/error-codes';
import { err } from '@/core/_shared/errors/factory';
@CommandHandler(UpdateRoomCommand)
export class UpdateRoomHandler implements ICommandHandler<UpdateRoomCommand> {
    constructor(private rooms: RoomRepoPort) {}
    async execute({ userId, roomId, dto }: UpdateRoomCommand) {
        const room = await this.rooms.findById(roomId);
        if (!room) throw err.notFound(ErrorCodes.ROOM.NOT_FOUND, 'اتاق پیدا نشد');
        if (room.ownerId !== userId) throw err.forbidden(ErrorCodes.ROOM.FORBIDDEN, 'اجازه ویرایش این اتاق را ندارید');
        Object.assign(room, dto);
        return this.rooms.save(room);
    }
}