import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './domain/models/user.entity';
import { RoleEntity } from './domain/models/role.entity';
import { UserRepoPort } from './application/ports/user-repo.port';
import { RoleRepoPort } from './application/ports/role-repo.port';
import { HasherPort } from './application/ports/hasher.port';
import { JwtPort } from './application/ports/jwt.port';
import { BcryptHasherAdapter } from './infrastructure/security/bcrypt-hasher.adapter';
import { NestJwtAdapter } from './infrastructure/security/nest-jwt.adapter';
import { AuthController } from '@/userInterfaces/rest/modules/api/auth/auth.controller';
import { RegisterUserHandler } from './application/command/register-user.handler';
import { TypeOrmUserRepo } from './infrastructure/repository/user.repo';
import { TypeOrmRoleRepo } from './infrastructure/repository/role.repo';
import { LoginUserHandler } from './application/command/login-user.handler';
import { EventBusModule } from '@/infrastructure/eventbus/event-bus.module';
import { AuthApiModule } from '@/userInterfaces/rest/components/guards/auth-api.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    EventBusModule,
    AuthApiModule,
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserHandler,
    LoginUserHandler,
    { provide: UserRepoPort, useClass: TypeOrmUserRepo },
    { provide: RoleRepoPort, useClass: TypeOrmRoleRepo },
    { provide: HasherPort, useClass: BcryptHasherAdapter },
    { provide: JwtPort, useClass: NestJwtAdapter },
    // RoleSeeder
  ],
})
export class IdentityModule {}
