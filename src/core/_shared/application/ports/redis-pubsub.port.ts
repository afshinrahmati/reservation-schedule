export abstract class RedisPubSubPort {
    abstract publish<T = any>(channel: string, payload: T): Promise<void>;
    abstract subscribe(
        pattern: string,
        handler: (channel: string, payload: any) => Promise<void> | void,
    ): Promise<void>;
}