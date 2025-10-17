import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisLockService {
    private publisher;
    private subscriber;
    private readonly logger = new Logger(RedisLockService.name);

    constructor() {
        this.init();
    }

    private async init() {
        this.publisher = createClient({ url: 'redis://localhost:6379' });
        this.subscriber = createClient({ url: 'redis://localhost:6379' });

        await Promise.all([
            this.publisher.connect(),
            this.subscriber.connect(),
        ]);

        await this.subscriber.configSet('notify-keyspace-events', 'Ex'); // 'Ex' = expire events
        await this.subscriber.psubscribe('__keyevent@0__:expired', (key) => this.handleExpired(key));

        this.logger.log('✅ Redis lock & expiration listener initialized');
    }

    async lock(resourceId: string, userId: string, ttlSeconds = 900) {
        const key = `booking:${resourceId}`;
        const isLocked = await this.publisher.set(key, userId, { NX: true, EX: ttlSeconds });
        if (!isLocked) throw new Error('Resource already booked');
        return true;
    }

    async unlock(resourceId: string) {
        await this.publisher.del(`booking:${resourceId}`);
    }

    private async handleExpired(key: string) {
        if (key.startsWith('booking:')) {
            const resourceId = key.split(':')[1];
            this.logger.warn(`⏰ Booking expired for resource: ${resourceId}`);

        }
    }
}