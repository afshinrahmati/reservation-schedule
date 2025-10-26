export abstract class LockPort {
  abstract acquire(key: string, val: string, ttlSec: number): Promise<boolean>;
  abstract release(key: string, val: string): Promise<void>;
}
