import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRoomCommand } from '@/core/room/application/command/create-room.command';
import { RoomRepoPort } from '@/core/room/application/ports/room-repo.port';

@CommandHandler(CreateRoomCommand)
export class CreateRoomHandler implements ICommandHandler<CreateRoomCommand> {
  constructor(private rooms: RoomRepoPort) {}
  async execute({ userId, dto }: CreateRoomCommand) {
    return this.rooms.save({
      ownerId: userId,
      name: dto.name,
      slotDurationMin: dto.slotDurationMin,
    });
  }
}
