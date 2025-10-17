import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenSignerPort } from '@/core/_port/auth/token-signer.port';

@Injectable()
export class JwtTokenSigner implements TokenSignerPort {
    constructor(private readonly jwt: JwtService) {}
    sign(payload: Record<string, any>) { return this.jwt.signAsync(payload); }
    verify(token: string) { return this.jwt.verifyAsync(token); }
}