import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { RegisterUserHandler } from '@/core/auth/application/command/register-user.handler';
import { LoginUserHandler } from '@/core/auth/application/command/login-user.handler';
import { PASSWORD_HASHER } from '@/core/_port/auth/password-hasher.port';
import { TOKEN_SIGNER } from '@/core/_port/auth/token-signer.port';
import {USER_REPOSITORY} from "@/core/user/domain/repository/userRepository.interface";
import {MysqlUserRepository} from "@/core/user/infrastructure/repository/user.repository";
import {BcryptHasher} from "@/core/auth/infrastructure/crypto/bcrypt.hasher";
import {JwtTokenSigner} from "@/core/auth/infrastructure/token/jwt.token-signer";
import {User} from "@/core/user/domain/models/user.entity";
import {JwtStrategy} from "@/userInterfaces/rest/components/guards/auth-api.guard";
import {EVENT_BUS} from "@/core/_port/common/event-bus.port";
import {RabbitMqEventBusAdapter} from "@/infrastructure/eventbus/rabbitmq-event-bus.adapter";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                secret: cfg.get('JWT_SECRET'),
                signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN') ?? '1d' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        { provide: USER_REPOSITORY, useClass: MysqlUserRepository },
        { provide: PASSWORD_HASHER, useClass: BcryptHasher },
        { provide: TOKEN_SIGNER, useClass: JwtTokenSigner },
        { provide: EVENT_BUS, useClass: RabbitMqEventBusAdapter },
        RegisterUserHandler,
        LoginUserHandler,
        JwtStrategy,
    ],
})
export class AuthModule {}