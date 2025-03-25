import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // get the roles from the metadata using the reflector
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    // if no roles are set, allow access
    if (!requiredRoles) return true;

    // get the user from the request
    const user = context.switchToHttp().getRequest().user;

    // if the user role is not in the required roles, throw an exception
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException(
        `Role ${user?.role} cannot access this route. Required: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
