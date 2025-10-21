import { InjectRepository } from '@nestjs/typeorm'; import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common'; import { RoomRepoPort } from '../../application/ports/room-repo.port';
import { RoomEntity } from '../../domain/models/room.entity';
@Injectable()
export class TypeOrmRoomRepo implements RoomRepoPort {
    constructor(@InjectRepository(RoomEntity) private repo: Repository<RoomEntity>) {}
    save(d: Partial<RoomEntity>) { return this.repo.save(d); }
    findById(id: string) { return this.repo.findOne({ where: { id } }); }
    listByOwner(ownerId: string) { return this.repo.find({ where: { ownerId } }); }
}