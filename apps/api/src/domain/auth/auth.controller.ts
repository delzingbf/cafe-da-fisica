import { API_PREFIX, type AdminResponse } from '@cafe-da-fisica/shared';
import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import type { Env } from '../../infrastructure/config/env.js';
import type { Admin } from '../admins/admin.entity.js';
import { AdminGuard, CurrentAdmin } from './admin.guard.js';
import { ChangeAdminPasswordDto, LoginDto } from './auth.dto.js';
import { AuthService, toAdminResponse } from './auth.service.js';
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from './session.js';

@Controller('auth')
export class AuthController {
    private readonly cookieOptions: CookieOptions;

    constructor(
        private readonly authService: AuthService,
        config: ConfigService<Env, true>,
    ) {
        this.cookieOptions = {
            // Unreadable from JavaScript, so an XSS bug cannot steal the session.
            httpOnly: true,
            // Not sent on requests started by other sites, which blocks CSRF.
            sameSite: 'strict',
            secure: config.get('NODE_ENV', { infer: true }) === 'production',
            path: `/${API_PREFIX}`,
            maxAge: SESSION_TTL_SECONDS * 1000,
        };
    }

    @Post('login')
    @HttpCode(200)
    // Limits brute-force attempts (see ThrottlerModule in AuthModule).
    @UseGuards(ThrottlerGuard)
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AdminResponse> {
        const { admin, token } = await this.authService.login(dto);
        res.cookie(SESSION_COOKIE, token, this.cookieOptions);
        return admin;
    }

    // The token stays valid until it expires; logging out only removes it from the browser.
    @Post('logout')
    @HttpCode(204)
    logout(@Res({ passthrough: true }) res: Response): void {
        res.clearCookie(SESSION_COOKIE, this.cookieOptions);
    }

    @Get('me')
    @UseGuards(AdminGuard)
    me(@CurrentAdmin() admin: Admin): AdminResponse {
        return toAdminResponse(admin);
    }

    @Post('password')
    @HttpCode(204)
    @UseGuards(AdminGuard, ThrottlerGuard)
    async changePassword(
        @CurrentAdmin() admin: Admin,
        @Body() dto: ChangeAdminPasswordDto,
    ): Promise<void> {
        await this.authService.changePassword(admin, dto);
    }
}
