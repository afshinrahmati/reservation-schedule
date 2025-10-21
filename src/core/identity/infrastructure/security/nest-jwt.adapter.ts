import { Injectable } from '@nestjs/common'; import { JwtService } from '@nestjs/jwt';
import { JwtPort } from '../../application/ports/jwt.port';
@Injectable() export class NestJwtAdapter implements JwtPort {
  constructor(private jwt: JwtService) {}
  sign(payload: any, opts?: { expiresIn?: string|number }) { return this.jwt.signAsync(payload, { expiresIn: '7d' }); }
  verify(t: string) { return this.jwt.verifyAsync(t); }
}