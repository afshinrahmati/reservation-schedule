import { Room } from '@/core/booking/domain/models/room.entity';

export interface RoomRepositoryPort {
    save(room: Room): Promise<Room>;
    findById(id: string): Promise<Room | null>;
    findByOwner(ownerId: string): Promise<Room[]>;
}
export const ROOM_REPOSITORY = Symbol('ROOM_REPOSITORY');