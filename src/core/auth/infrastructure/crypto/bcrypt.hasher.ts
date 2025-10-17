import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PasswordHasherPort } from '@/core/_port/auth/password-hasher.port';

@Injectable()
export class BcryptHasher implements PasswordHasherPort {
    hash(plain: string) { return bcrypt.hash(plain, 10); }
    compare(plain: string, hash: string) { return bcrypt.compare(plain, hash); }
}