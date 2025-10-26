import { LockPort } from '../../application/ports/lock.port';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisLockAdapter implements LockPort, OnModuleInit {
  private client!: RedisClientType;
  async onModuleInit() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    await this.client.connect();
  }
  acquire(key: string, val: string, ttl: number) {
    return this.client
      .set(key, val, { NX: true, EX: ttl })
      .then((r) => r === 'OK');
  }
  async release(key: string, val: string) {
    const v = await this.client.get(key);
    if (v === val) await this.client.del(key);
  }
}
