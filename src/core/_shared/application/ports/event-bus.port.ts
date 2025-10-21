export abstract class EventBusPort {
  abstract publish<T>(routingKey: string, payload: T): Promise<void>;
  abstract subscribe(routingKey: string, handler: (payload: any) => Promise<void>): Promise<void>;
}