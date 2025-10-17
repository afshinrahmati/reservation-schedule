import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisLockService {
    private client: RedisClientType;
    private readonly logger = new Logger(RedisLockService.name);

    constructor(private readonly config: ConfigService) {}

    async onModuleInit() {
        const host = this.config.get<string>('redis.host');
        const port = this.config.get<number>('redis.port');
        const password = this.config.get<string>('redis.password');
        const db = this.config.get<number>('redis.db');

        const url = password
            ? `redis://:${password}@${host}:${port}/${db}`
            : `redis://${host}:${port}/${db}`;

        this.client = createClient({ url });
        this.client.on('error', (err) => this.logger.error('Redis error', err.message));
        await this.client.connect();

        this.logger.log(`✅ Connected to Redis at ${host}:${port} (db ${db})`);
    }

    async lock(key: string, value: string, ttlSeconds?: number) {
        const ttl = ttlSeconds || this.config.get<number>('redis.ttl');
        const ok = await this.client.set(key, value, { NX: true, EX: ttl });
        return !!ok;
    }

    async unlock(key: string) {
        await this.client.del(key);
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }
}