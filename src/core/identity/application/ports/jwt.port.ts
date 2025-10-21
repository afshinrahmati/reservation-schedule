
export abstract class JwtPort {
  abstract sign(payload: any, options?: { expiresIn?: string | number }): Promise<string>;
  abstract verify<T = any>(token: string): Promise<T>;
}