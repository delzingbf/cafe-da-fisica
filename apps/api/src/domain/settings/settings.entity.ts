import {
    Check,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Admin } from '../admins/admin.entity.js';
import { EMAIL_CHECKS } from '../../infrastructure/database/checks.js';

// Single-row table: the primary key is a boolean that must be TRUE, so only one row can exist.
@Entity({ name: 'settings' })
@Check('CHK_settings_singleton', '"id"')
@Check(
    'CHK_settings_order_notification_email_format',
    EMAIL_CHECKS.format('order_notification_email'),
)
@Check(
    'CHK_settings_order_notification_email_lowercase',
    EMAIL_CHECKS.lowercase('order_notification_email'),
)
export class Settings {
    @PrimaryColumn({ type: 'boolean', default: true })
    id: boolean;

    @Column({ type: 'text', name: 'order_notification_email' })
    orderNotificationEmail: string;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @Column({ type: 'integer', name: 'updated_by', nullable: true })
    updatedById: number | null;

    @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'updated_by' })
    updatedBy: Admin | null;
}
