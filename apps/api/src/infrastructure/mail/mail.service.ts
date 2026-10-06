import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Env } from '../config/env.js';

export interface MailMessage {
    to: string | string[];
    subject: string;
    html: string;
    /** Plain-text fallback. Resend derives one from `html` when omitted. */
    text?: string;
    replyTo?: string;
}

// Sends transactional emails through Resend. Without RESEND_API_KEY (development, tests) the
// message is logged instead, so the rest of the app never needs to know whether email is set up.
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly resend: Resend | null;
    private readonly from: string;

    constructor(config: ConfigService<Env, true>) {
        const apiKey = config.get('RESEND_API_KEY', { infer: true });
        this.resend = apiKey ? new Resend(apiKey) : null;
        this.from = config.get('EMAIL_FROM', { infer: true });
    }

    async send(message: MailMessage): Promise<void> {
        if (!this.resend) {
            this.logger.log(
                `RESEND_API_KEY not set, skipping "${message.subject}" to ${String(message.to)}`,
            );
            return;
        }

        // The SDK reports API failures in `error` instead of throwing.
        const { error } = await this.resend.emails.send({ from: this.from, ...message });
        if (error) {
            throw new Error(
                `Resend rejected "${message.subject}": ${error.name} (${error.message})`,
            );
        }
    }
}
