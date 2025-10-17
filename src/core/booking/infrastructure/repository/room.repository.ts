import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '@/core/booking/domain/models/room.entity';
import { RoomModel } from '@/core/booking/domain/models/room.model';
import {RoomRepositoryPort} from "@/core/booking/domain/repository/roomRepository.interface";

@Injectable()
export class RoomTypeOrmRepository implements RoomRepositoryPort {
    constructor(@InjectRepository(Room) private readonly repo: Repository<Room>) {}

    async save(room: RoomModel): Promise<RoomModel> {
        const row = this.repo.create(room);
        const saved = await this.repo.save(row);
        return new RoomModel(saved.id, saved.ownerId, saved.name, saved.slotDurationMinutes, saved.createdAt);
    }

    async findById(id: string): Promise<RoomModel | null> {
        const r = await this.repo.findOne({ where: { id } });
        return r ? new RoomModel(r.id, r.ownerId, r.name, r.slotDurationMinutes, r.createdAt) : null;
    }

    async findByOwner(ownerId: string): Promise<RoomModel[]> {
        const rows = await this.repo.find({ where: { ownerId } });
        return rows.map(r => new RoomModel(r.id, r.ownerId, r.name, r.slotDurationMinutes, r.createdAt));
    }
}