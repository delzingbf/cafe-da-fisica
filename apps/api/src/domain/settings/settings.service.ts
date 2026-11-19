import type {
    SettingsResponse,
    UpdateOrderNotificationEmailResponse,
} from '@cafe-da-fisica/shared';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { MailService } from '../../infrastructure/mail/mail.service.js';
import type { Admin } from '../admins/admin.entity.js';
import { Settings } from './settings.entity.js';
import { orderNotificationEmailConfirmation } from './order-notification-email.template.js';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor(
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
        private readonly mailService: MailService,
    ) {}

    async getSettings(): Promise<SettingsResponse> {
        const settings = await this.settingsRepository.findOneBy({ id: true });
        return { orderNotificationEmail: settings?.orderNotificationEmail ?? null };
    }

    async updateOrderNotificationEmail(
        email: string,
        admin: Admin,
    ): Promise<UpdateOrderNotificationEmailResponse> {
        const settings = await this.settingsRepository.findOneBy({ id: true });
        await this.settingsRepository.save(
            settings
                ? Object.assign(settings, { orderNotificationEmail: email, updatedById: admin.id })
                : this.settingsRepository.create({
                      id: true,
                      orderNotificationEmail: email,
                      updatedById: admin.id,
                  }),
        );

        try {
            const confirmationEmailSent = await this.mailService.send({
                to: email,
                ...orderNotificationEmailConfirmation(email),
            });
            return { confirmationEmailSent };
        } catch (error) {
            this.logger.error(
                `Order notification email was updated, but confirmation could not be sent to ${email}`,
                error,
            );
            return { confirmationEmailSent: false };
        }
    }
}
