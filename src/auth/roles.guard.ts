// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) return true;

    const user = context.switchToHttp().getRequest().user;
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException(
        `Role ${user?.role} cannot access this route. Required: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}