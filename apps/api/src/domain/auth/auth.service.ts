import type { AdminResponse } from '@cafe-da-fisica/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { Admin } from '../admins/admin.entity.js';
import type { ChangeAdminPasswordDto, LoginDto } from './auth.dto.js';
import { hashPassword, verifyPassword } from './password.js';
import type { SessionPayload } from './session.js';

export function toAdminResponse(admin: Admin): AdminResponse {
    return { id: admin.id, email: admin.email };
}

@Injectable()
export class AuthService {
    // Checked when the email is unknown, so that case takes as long as a wrong password and
    // response times do not reveal which emails belong to an admin.
    private readonly dummyHash = hashPassword(randomUUID());

    constructor(
        @InjectRepository(Admin)
        private readonly adminsRepository: Repository<Admin>,
        private readonly jwtService: JwtService,
    ) {}

    async login(dto: LoginDto): Promise<{ admin: AdminResponse; token: string }> {
        const admin = await this.adminsRepository.findOneBy({ email: dto.email });
        const passwordMatches = await verifyPassword(
            dto.password,
            admin?.passwordHash ?? (await this.dummyHash),
        );
        if (!admin || !passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        await this.adminsRepository.update(admin.id, { lastLoginAt: new Date() });

        const payload: SessionPayload = { sub: String(admin.id) };
        return { admin: toAdminResponse(admin), token: await this.jwtService.signAsync(payload) };
    }

    async changePassword(admin: Admin, dto: ChangeAdminPasswordDto): Promise<void> {
        const passwordMatches = await verifyPassword(dto.currentPassword, admin.passwordHash);
        if (!passwordMatches) throw new UnauthorizedException('Current password is incorrect');

        const passwordHash = await hashPassword(dto.newPassword);
        await this.adminsRepository.update(admin.id, { passwordHash });
    }

    /**
     * The admin a session token belongs to, or null if the token is invalid, expired or its admin
     * was deleted (deleting an admin ends their sessions immediately).
     */
    async findSessionAdmin(token: string): Promise<Admin | null> {
        let payload: SessionPayload;
        try {
            payload = await this.jwtService.verifyAsync<SessionPayload>(token);
        } catch {
            return null;
        }

        const id = Number(payload.sub);
        return Number.isSafeInteger(id) ? this.adminsRepository.findOneBy({ id }) : null;
    }
}
