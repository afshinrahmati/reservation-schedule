import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HasherPort } from '../../application/ports/hasher.port';

@Injectable()
export class BcryptHasherAdapter implements HasherPort {
  hash(p: string) {
    return bcrypt.hash(p, 12);
  }
  compare(p: string, h: string) {
    return bcrypt.compare(p, h);
  }
}
