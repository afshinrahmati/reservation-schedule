export interface EventBusPort {
    publish(event: any): Promise<void>;
}
export const EVENT_BUS = Symbol('EVENT_BUS');