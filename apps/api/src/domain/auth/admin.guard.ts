import {
    type CanActivate,
    createParamDecorator,
    type ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import type { Admin } from '../admins/admin.entity.js';
import { AuthService } from './auth.service.js';
import { type AuthenticatedRequest, SESSION_COOKIE } from './session.js';

/**
 * Lets the request through only with a valid admin session cookie; otherwise responds 401.
 * To protect a controller, import AuthModule in its module and add `@UseGuards(AdminGuard)`.
 */
@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token: unknown = request.cookies?.[SESSION_COOKIE];

        const admin =
            typeof token === 'string' ? await this.authService.findSessionAdmin(token) : null;
        if (!admin) throw new UnauthorizedException();

        request.admin = admin;
        return true;
    }
}

/** The logged-in admin, in a handler protected by AdminGuard. */
export const CurrentAdmin = createParamDecorator(
    (_data: unknown, context: ExecutionContext): Admin =>
        context.switchToHttp().getRequest<AuthenticatedRequest>().admin,
);
