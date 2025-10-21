import { EventBusPort } from '@/core/_shared/application/ports/event-bus.port';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RoleRepoPort } from '../ports/role-repo.port';
import { JwtPort } from '@/core/identity/application/ports/jwt.port';
import { HasherPort } from '@/core/identity/application/ports/hasher.port';
import { UserRepoPort } from '@/core/identity/application/ports/user-repo.port'
import { RegisterUserCommand } from './register-user.command';
import { err } from '@/core/_shared/errors/factory';
import { ErrorCodes } from '@/core/_shared/errors/error-codes';


@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private users: UserRepoPort, private roles: RoleRepoPort,
    private hasher: HasherPort, private jwt: JwtPort, private bus: EventBusPort,
  ) {}
  async execute({ email,role,password,fullName }: RegisterUserCommand) {
    const exists = await this.users.findByEmail(email);
    if (exists) throw err.badRequest(ErrorCodes.IDENTITY.EMAIL_EXISTS, 'کاربر شما ثبت نام کردید ک  ');
    const passwordHash = await this.hasher.hash(password);
    const roleInfo = await this.roles.findByCode(role ?? 'GUEST');

    const user = await this.users.save({ email: email, passwordHash, fullName: fullName, roles: roleInfo ? [roleInfo] : [] });
    const token = await this.jwt.sign({ sub: user.id, email: user.email, roles: user.roles?.map(r => r.code) ?? [] });
    await this.bus.publish('identity.user.registered', {
      userId: user.id, email: user.email, fullName: user.fullName ?? null, occurredAt: new Date().toISOString(),
    });

    return { access_token: token };
  }
}