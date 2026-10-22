import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Env } from '../../infrastructure/config/env.js';
import { Admin } from '../admins/admin.entity.js';
import { AdminGuard } from './admin.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SESSION_TTL_SECONDS } from './session.js';

// Admin login. Import in any feature module whose controllers use `@UseGuards(AdminGuard)`.
@Module({
    imports: [
        TypeOrmModule.forFeature([Admin]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService<Env, true>) => ({
                secret: config.get('JWT_SECRET', { infer: true }),
                signOptions: { expiresIn: SESSION_TTL_SECONDS },
            }),
        }),
        // 5 login attempts per minute per IP. Only routes with `@UseGuards(ThrottlerGuard)` count.
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    ],
    controllers: [AuthController],
    providers: [AuthService, AdminGuard],
    exports: [AuthService, AdminGuard],
})
export class AuthModule {}
