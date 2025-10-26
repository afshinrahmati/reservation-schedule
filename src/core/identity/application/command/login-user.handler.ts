import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from './login-user.command';
import { UserRepoPort } from '../ports/user-repo.port';
import { HasherPort } from '../ports/hasher.port';
import { JwtPort } from '../ports/jwt.port';
import { EventBusPort } from '@/core/_shared/application/ports/event-bus.port';
import { ErrorCodes } from '@/core/_shared/errors/error-codes';
import { err } from '@/core/_shared/errors/factory';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private users: UserRepoPort,
    private hasher: HasherPort,
    private jwt: JwtPort,
    private bus: EventBusPort,
  ) {}
  async execute({ dto }: LoginUserCommand) {
    try {
      const user = await this.users.findByEmail(dto.email);
      if (!user) {
        throw err.notFound(
          ErrorCodes.IDENTITY.USER_NOT_FOUND,
          'کاربر پیدا نشد',
        );
      }

      const ok = await this.hasher.compare(dto.password, user.passwordHash);
      if (!ok) {
        throw err.unauthorized(
          ErrorCodes.IDENTITY.INVALID_CREDENTIALS,
          'ایمیل یا رمز عبور اشتباه است',
        );
      }

      const token = await this.jwt.sign({
        sub: user.id,
        email: user.email,
        roles: user.roles?.map((r) => r.code) ?? [],
      });
      await this.bus.publish('identity.user.logged_in', {
        userId: user.id,
        email: user.email,
        occurredAt: new Date().toISOString(),
      });

      return { access_token: token };
    } catch (error) {
      throw error;
    }
  }
}
