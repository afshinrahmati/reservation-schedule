
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {NotificationService} from "@/core/notification/domain/services/notification.service";

@Injectable()
export class RabbitMqListener {
    private readonly logger = new Logger(RabbitMqListener.name);

    constructor(
        private readonly config: ConfigService,
        private readonly notification: NotificationService,
    ) {}

    async start() {
        const uri = `amqp://${this.config.get('rabbit.user')}:${this.config.get('rabbit.password')}@${this.config.get('rabbit.host')}:${this.config.get('rabbit.port')}`;
        const exchange = this.config.get('rabbit.exchange');

        try {
            const conn = await amqp.connect(uri);
            const channel = await conn.createChannel();

            await channel.assertExchange(exchange, 'fanout', { durable: true });
            const q = await channel.assertQueue('', { exclusive: true });
            await channel.bindQueue(q.queue, exchange, '');

            this.logger.log(`📡 Listening for events on ${exchange}`);

            channel.consume(q.queue, async (msg) => {
                if (!msg) return;
                const content = JSON.parse(msg.content.toString());
                await this.notification.handleEvent(content);
                channel.ack(msg);
            });
        } catch (err) {
            this.logger.error(`❌ RabbitMQ Listener failed: ${err.message}`);
            setTimeout(() => this.start(), 5000);
        }
    }
}