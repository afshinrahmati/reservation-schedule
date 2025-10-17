import { Injectable,Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as userRepositoryInterface from "@/core/user/domain/repository/userRepository.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(cfg: ConfigService, @Inject(userRepositoryInterface.USER_REPOSITORY)
    private readonly users: userRepositoryInterface.UserRepositoryPort,) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: cfg.get('JWT_SECRET') ?? 'supersecret',
        });
    }
    async validate(payload: any) {
        return this.users.findById(payload.sub);
    }
}