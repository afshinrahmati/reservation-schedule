import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(ctx: ExecutionContext) {
        const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
        if (!roles) return true;
        const user = ctx.switchToHttp().getRequest().user;
        return roles.includes(user?.role);
    }
}