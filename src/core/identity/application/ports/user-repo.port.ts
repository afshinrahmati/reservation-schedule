import { UserEntity } from '../../domain/models/user.entity';

export abstract class UserRepoPort {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract save(user: Partial<UserEntity>): Promise<UserEntity>;
}
