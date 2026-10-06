import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { EMAIL_CHECKS } from '../../infrastructure/database/checks.js';

@Entity({ name: 'admins' })
@Unique('UQ_admins_email', ['email'])
@Check('CHK_admins_email_format', EMAIL_CHECKS.format('email'))
@Check('CHK_admins_email_lowercase', EMAIL_CHECKS.lowercase('email'))
export class Admin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    email: string;

    @Column({ type: 'text', name: 'password_hash' })
    passwordHash: string;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
    lastLoginAt: Date | null;
}
