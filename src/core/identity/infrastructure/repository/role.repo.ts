import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepoPort } from '../../application/ports/role-repo.port';
import { RoleEntity } from '../../domain/models/role.entity';

@Injectable()
export class TypeOrmRoleRepo implements RoleRepoPort {
  constructor(
    @InjectRepository(RoleEntity) private repo: Repository<RoleEntity>,
  ) {}
  findByCode(code: 'ADMIN' | 'HOST' | 'GUEST') {
    return this.repo.findOne({ where: { code } });
  }
}
