import { SetMetadata } from '@nestjs/common';

//metadata key for roles
export const ROLES_KEY = 'roles';

//decorator to set roles for a route
//this decorator will be used in the controller to set the roles for a route
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
