import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import {EventBusPort} from "@/core/_shared/application/ports/event-bus.port";
@Injectable()
export class RedisExpirySubscriberAdapter implements OnModuleInit {
    constructor(private events: EventBusPort) {}
    async onModuleInit() {
        const sub = createClient({ url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
        await sub.connect();
        await sub.configSet('notify-keyspace-events','Ex');
        await sub.subscribe('__keyevent@0__:expired', async (key) => {
            if (key.startsWith('hold:booking:')) {
                const bookingId = key.split(':')[2];
                await this.events.publish('booking.payment_window.ended', { bookingId });
            }
        });
    }
}