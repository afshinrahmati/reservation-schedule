import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPort } from '@/core/identity/application/ports/jwt.port';

@Injectable()
export class NestJwtAdapter implements JwtPort {
  constructor(private jwt: JwtService) {}
  sign(payload: any, options?: { expiresIn?: string | number }) {
    return this.jwt.signAsync(payload, { expiresIn: '7d' });
  }
  verify(token: string) {
    return this.jwt.verifyAsync(token);
  }
}
