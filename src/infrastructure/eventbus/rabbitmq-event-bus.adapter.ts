import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EventBusPort } from '@/core/_port/common/event-bus.port';

@Injectable()
export class RabbitMqEventBusAdapter implements EventBusPort {
    private channel: amqp.Channel;
    private readonly logger = new Logger(RabbitMqEventBusAdapter.name);

    constructor(private readonly config: ConfigService) {
        this.init();
    }

    private async init() {
        const host = this.config.get<string>('rabbit.host');
        const port = this.config.get<number>('rabbit.port');
        const user = this.config.get<string>('rabbit.user');
        const password = this.config.get<string>('rabbit.password');
        const exchange = this.config.get<string>('rabbit.exchange');

        const uri = `amqp://${user}:${password}@${host}:${port}`;

        try {
            const conn = await amqp.connect(uri);
            this.channel = await conn.createChannel();
            await this.channel.assertExchange(exchange, 'fanout', { durable: true });
            this.logger.log(`✅ Connected to RabbitMQ at ${uri}, exchange: ${exchange}`);
        } catch (err) {
            this.logger.error(`❌ RabbitMQ connection failed: ${err.message}`);
            // fallback به حالت mock
            this.channel = null;
        }
    }

    async publish(event: any): Promise<void> {
        const exchange = this.config.get<string>('rabbit.exchange');

        if (!this.channel) {
            this.logger.warn(`⚠️ RabbitMQ unavailable → Mock publish: ${event.constructor.name}`);
            return;
        }

        try {
            const payload = JSON.stringify({
                type: event.constructor.name,
                data: event,
                timestamp: new Date(),
            });
            this.channel.publish(exchange, '', Buffer.from(payload));
            this.logger.log(`📨 Event published: ${event.constructor.name}`);
        } catch (err) {
            this.logger.warn(`⚠️ Failed to publish event: ${err.message}`);
        }
    }
}
