export interface TokenSignerPort {
    sign(payload: Record<string, any>): Promise<string>;
    verify(token: string): Promise<any>;
}

export const TOKEN_SIGNER = Symbol('TOKEN_SIGNER');