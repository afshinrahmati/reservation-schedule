import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {UserRepositoryPort} from "@/core/user/domain/repository/userRepository.interface";
import {User} from "@/core/user/domain/models/user.entity";

@Injectable()
export class MysqlUserRepository implements UserRepositoryPort {
    constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

    save(user: User) {
        return this.repo.save(user);
    }

    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }
}