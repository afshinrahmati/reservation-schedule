import { RoomEntity } from '../../domain/models/room.entity';
export abstract class RoomRepoPort {
    abstract save(data: Partial<RoomEntity>): Promise<RoomEntity>;
    abstract findById(id: string): Promise<RoomEntity | null>;
    abstract listByOwner(ownerId: string): Promise<RoomEntity[]>;
}