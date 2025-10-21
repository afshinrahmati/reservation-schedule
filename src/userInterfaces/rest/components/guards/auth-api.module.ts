import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@/core/_shared/security/jwt.strategy';
import {AuthApiGuard} from "@/userInterfaces/rest/components/guards/auth-api.guard";

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                secret: cfg.get<string>('JWT_SECRET') || 'dev-secret',
                signOptions: { expiresIn: '7d' },
            }),
        }),
    ],
    providers: [JwtStrategy, AuthApiGuard],
    exports: [AuthApiGuard, JwtModule, PassportModule],
})
export class AuthApiModule {}