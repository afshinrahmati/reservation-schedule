import { EventBusPort } from '@/core/_shared/application/ports/event-bus.port';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQEventBusAdapter implements EventBusPort, OnModuleInit {
  private conn!: amqp.Connection;
  private ch!: amqp.Channel;
  private readonly exchange = 'domain_events';

  constructor(private cfg: ConfigService) {}

  async onModuleInit() {
    const r = this.cfg.get('rabbit'); // از registerAs('rabbit')
    this.conn = await amqp.connect({
      protocol: 'amqp',
      hostname: r.host,
      port: r.port,
      username: r.user,
      password: r.password,  
      vhost: r.vhost,
    });
    this.ch = await this.conn.createChannel();
    await this.ch.assertExchange(this.exchange, 'topic', { durable: true });
  }

  async publish(routingKey: string, payload: any) {
    this.ch.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true, contentType: 'application/json',
    });
  }

  async subscribe(routingKey: string, handler: (payload: any) => Promise<void>) {
    const q = await this.ch.assertQueue('', { exclusive: true });
    await this.ch.bindQueue(q.queue, this.exchange, routingKey);
    await this.ch.consume(q.queue, async (msg) => {
      if (!msg) return;
      try { await handler(JSON.parse(msg.content.toString())); this.ch.ack(msg); }
      catch { this.ch.nack(msg, false, true); }
    });
  }
}