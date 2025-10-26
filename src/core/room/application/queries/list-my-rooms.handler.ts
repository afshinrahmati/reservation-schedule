import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMyRoomsQuery } from '@/core/room/application/queries/list-my-rooms.query';
import { RoomRepoPort } from '@/core/room/application/ports/room-repo.port';

@QueryHandler(ListMyRoomsQuery)
export class ListMyRoomsHandler implements IQueryHandler<ListMyRoomsQuery> {
  constructor(private rooms: RoomRepoPort) {}
  execute({ ownerId }: ListMyRoomsQuery) {
    return this.rooms.listByOwner(ownerId);
  }
}
