import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as passwordHasherPort from '@/core/_port/auth/password-hasher.port';
import {RegisterUserCommand} from './register-user.command';
import * as userRepositoryInterface from "@/core/user/domain/repository/userRepository.interface";
import {User} from "@/core/user/domain/models/user.entity";
import {UserRole} from "@/core/user/domain/enum/user-role.enum";
import * as eventBusPort from "@/core/_port/common/event-bus.port";
import {UserRegisteredEvent} from "@/core/auth/domain/event/user-registred.event";

@Injectable()
export class RegisterUserHandler {
    constructor(
        @Inject(userRepositoryInterface.USER_REPOSITORY) private readonly users: userRepositoryInterface.UserRepositoryPort,
        @Inject(passwordHasherPort.PASSWORD_HASHER) private readonly hasher: passwordHasherPort.PasswordHasherPort,
        @Inject(eventBusPort.EVENT_BUS) private readonly eventBus: eventBusPort.EventBusPort,
    ) {}

    async execute(cmd: RegisterUserCommand) {
        const exists = await this.users.findByEmail(cmd.email);
        if (exists) throw new BadRequestException('User already exists');

        const hash = await this.hasher.hash(cmd.password);
        const user = new User();
        user.id = randomUUID();
        user.email = cmd.email;
        user.passwordHash = hash;
        user.role = UserRole.USER;
        await this.eventBus.publish(new UserRegisteredEvent(user.id, user.email));
        return this.users.save(user);
    }
}