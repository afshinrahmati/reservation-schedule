import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as passwordHasherPort from '@/core/_port/auth/password-hasher.port';
import * as tokenSignerPort from '@/core/_port/auth/token-signer.port';
import * as userRepositoryInterface from "@/core/user/domain/repository/userRepository.interface";
import {LoginUserCommand} from "@/core/auth/application/command/ login-user.command";
import {USER_REPOSITORY} from "@/core/user/domain/repository/userRepository.interface";
import * as eventBusPort from "@/core/_port/common/event-bus.port";
import {UserLoggedInEvent} from "@/core/auth/domain/event/user-logged-in.event";

@Injectable()
export class LoginUserHandler {
    constructor(
        @Inject(USER_REPOSITORY) private readonly users: userRepositoryInterface.UserRepositoryPort,
        @Inject(passwordHasherPort.PASSWORD_HASHER) private readonly hasher: passwordHasherPort.PasswordHasherPort,
        @Inject(tokenSignerPort.TOKEN_SIGNER) private readonly token: tokenSignerPort.TokenSignerPort,
        @Inject(eventBusPort.EVENT_BUS) private readonly eventBus: eventBusPort.EventBusPort,
    ) {}

    async execute(cmd: LoginUserCommand) {
        const user = await this.users.findByEmail(cmd.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const ok = await this.hasher.compare(cmd.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        const accessToken = await this.token.sign({ sub: user.id, role: user.role });
        await this.eventBus.publish(new UserLoggedInEvent(user.id, user.email));
        return { accessToken };
    }
}