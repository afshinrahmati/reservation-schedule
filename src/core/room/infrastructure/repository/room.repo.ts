import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RoomRepoPort } from '@/core/room/application/ports/room-repo.port';
import { RoomEntity } from '@/core/room/domain/models/room.entity';

@Injectable()
export class TypeOrmRoomRepoAdapter implements RoomRepoPort {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly repo: Repository<RoomEntity>,
  ) {}

  async save(data: Partial<RoomEntity>): Promise<RoomEntity> {
    const entity = this.repo.create(data);
    return await this.repo.save(entity);
  }

  async findById(id: string): Promise<RoomEntity | null> {
    console.log(89);
    return await this.repo.findOne({ where: { id } });
  }

  async listByOwner(ownerId: string): Promise<RoomEntity[]> {
    return await this.repo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }
}
