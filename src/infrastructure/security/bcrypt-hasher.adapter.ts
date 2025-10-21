import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HasherPort } from '@/core/identity/application/ports/hasher.port';

@Injectable()
export class BcryptHasherAdapter implements HasherPort {
  async hash(plain: string) { return bcrypt.hash(plain, 12); }
  async compare(plain: string, hash: string) { return bcrypt.compare(plain, hash); }
}