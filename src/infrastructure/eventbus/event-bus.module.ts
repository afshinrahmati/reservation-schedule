import { EventBusPort } from '@/core/_shared/application/ports/event-bus.port';
import { Global, Module } from '@nestjs/common';
import { RabbitMQEventBusAdapter } from './rabbitmq-event-bus.adapter';

@Global()
@Module({
  providers: [{ provide: EventBusPort, useClass: RabbitMQEventBusAdapter }],
  exports: [{ provide: EventBusPort, useClass: RabbitMQEventBusAdapter }],
})
export class EventBusModule {}
