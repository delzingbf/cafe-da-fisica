import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { MailService, type MailMessage } from '../../mail/mail.service.js';
import { Settings } from '../../settings/settings.entity.js';
import type { Order } from '../order.entity.js';
import { newOrderEmail, orderConfirmationEmail } from './order-email.templates.js';

@Injectable()
export class OrderEmailsService {
    private readonly logger = new Logger(OrderEmailsService.name);

    constructor(
        private readonly mailService: MailService,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
    ) {}

    async sendOrderCreated(order: Order): Promise<void> {
        const messages: MailMessage[] = [
            { to: order.customerEmail, ...orderConfirmationEmail(order) },
        ];

        const settings = await this.settingsRepository.findOneBy({ id: true });
        if (settings) {
            messages.push({
                to: settings.orderNotificationEmail,
                replyTo: order.customerEmail,
                ...newOrderEmail(order),
            });
        } else {
            this.logger.warn(`No settings row, skipping new-order notification for #${order.id}`);
        }

        const results = await Promise.allSettled(messages.map((m) => this.mailService.send(m)));
        results.forEach((result, i) => {
            if (result.status === 'rejected') {
                this.logger.error(`Failed to send "${messages[i].subject}"`, result.reason);
            }
        });
    }
}
