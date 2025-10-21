// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
//
// import {UserRepoPort} from "@/core/identity/application/ports/user-repo.port";
//
// @Injectable()
// export class MysqlUserRepository implements UserRepoPort {
//     constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
//
//     save(user: User) {
//         return this.repo.save(user);
//     }
//
//     findByEmail(email: string) {
//         return this.repo.findOne({ where: { email } });
//     }
//
//     findById(id: string) {
//         return this.repo.findOne({ where: { id } });
//     }
// }