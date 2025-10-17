import {User} from "@/core/user/domain/models/user.entity";

export interface UserRepositoryPort {
    save(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');