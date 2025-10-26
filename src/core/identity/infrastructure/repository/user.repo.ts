import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepoPort } from '../../application/ports/user-repo.port';
import { UserEntity } from '../../domain/models/user.entity';

@Injectable()
export class TypeOrmUserRepo implements UserRepoPort {
  constructor(
    @InjectRepository(UserEntity) private repo: Repository<UserEntity>,
  ) {}
  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  save(u: Partial<UserEntity>) {
    return this.repo.save(u);
  }
}
