import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { RedisPubSubPort } from '@/core/_shared/application/ports/redis-pubsub.port';

type Json = Record<string, any>;

@Injectable()
export class RedisPubSubAdapter
  implements RedisPubSubPort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisPubSubAdapter.name);
  private pub!: RedisClientType;
  private sub!: RedisClientType;
  private handlers: Array<{
    pattern: string;
    fn: (ch: string, data: any) => any;
  }> = [];

  private url = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
  private database = Number(process.env.REDIS_DB || 0);

  async onModuleInit() {
    this.pub = createClient({ url: this.url, database: this.database });
    this.sub = createClient({ url: this.url, database: this.database });

    this.pub.on('error', (e) => this.logger.error('publisher error', e as any));
    this.sub.on('error', (e) =>
      this.logger.error('subscriber error', e as any),
    );

    await this.pub.connect();
    await this.sub.connect();

    await this.sub.pSubscribe('*', async (message, channel) => {
      const raw = message;
      let data: Json | string = raw;
      try {
        data = JSON.parse(raw);
      } catch {}

      for (const h of this.handlers) {
        if (this.match(h.pattern, channel)) {
          try {
            await h.fn(channel, data);
          } catch (e) {
            this.logger.error(`handler failed for ${channel}`, e as any);
          }
        }
      }
    });

    this.logger.log(`Redis Pub/Sub connected (db=${this.database})`);
  }

  async onModuleDestroy() {
    try {
      await this.sub?.quit();
    } catch {}
    try {
      await this.pub?.quit();
    } catch {}
  }

  async publish<T = any>(channel: string, payload: T): Promise<void> {
    const body =
      typeof payload === 'string'
        ? payload
        : JSON.stringify({
            v: 1,
            ts: new Date().toISOString(),
            payload,
          });
    await this.pub.publish(channel, body);
  }

  async subscribe(
    pattern: string,
    handler: (channel: string, payload: any) => any,
  ): Promise<void> {
    this.handlers.push({ pattern, fn: handler });
  }

  private match(pattern: string, channel: string): boolean {
    if (pattern === '*') return true;
    const rx = new RegExp(
      '^' +
        pattern
          .split('.')
          .map((p) =>
            p === '*' ? '[^.]*' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          )
          .join('\\.') +
        '$',
    );
    return rx.test(channel);
  }
}
