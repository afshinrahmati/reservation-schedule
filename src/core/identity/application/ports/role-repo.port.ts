import { RoleEntity } from '../../domain/models/role.entity';

export abstract class RoleRepoPort {
  abstract findByCode(
    code: 'ADMIN' | 'HOST' | 'GUEST',
  ): Promise<RoleEntity | null>;
}
