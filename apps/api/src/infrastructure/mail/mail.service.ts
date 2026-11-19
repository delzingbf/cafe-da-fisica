import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type { Env } from '../config/env.js';

export interface MailMessage {
    to: string | string[];
    subject: string;
    html: string;
    /** Plain-text version, for mail clients that do not show HTML. */
    text?: string;
    replyTo?: string;
}

// Sends transactional emails over SMTP (Gmail by default, see env.ts). Without SMTP_USER and
// SMTP_PASSWORD (development, tests) the message is logged instead, so the rest of the app never
// needs to know whether email is set up.
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly transporter: Transporter | null;
    private readonly from: string;

    constructor(config: ConfigService<Env, true>) {
        const user = config.get('SMTP_USER', { infer: true });
        const pass = config.get('SMTP_PASSWORD', { infer: true });
        const port = config.get('SMTP_PORT', { infer: true });

        this.transporter =
            user && pass
                ? createTransport({
                      host: config.get('SMTP_HOST', { infer: true }),
                      port,
                      // 465 speaks TLS from the start; 587 starts plain and upgrades (STARTTLS).
                      secure: port === 465,
                      auth: { user, pass },
                      // The defaults wait minutes; "Salvar e-mail" in the admin waits for the send.
                      connectionTimeout: 10_000,
                      greetingTimeout: 10_000,
                      socketTimeout: 20_000,
                  })
                : null;
        // Gmail sends as the account that logs in whatever the From says, so that is the default.
        this.from =
            config.get('EMAIL_FROM', { infer: true }) ??
            `Café da Física <${user ?? 'noreply@localhost'}>`;
    }

    /** Resolves `true` once the server accepts the message, `false` if email is not set up. */
    async send(message: MailMessage): Promise<boolean> {
        if (!this.transporter) {
            this.logger.log(
                `SMTP_USER/SMTP_PASSWORD not set, skipping "${message.subject}" to ${String(message.to)}`,
            );
            return false;
        }

        try {
            await this.transporter.sendMail({ from: this.from, ...message });
        } catch (error) {
            // Wrong credentials, a blocked port or a rejected address all end up here.
            const reason = error instanceof Error ? error.message : String(error);
            throw new Error(`Could not send "${message.subject}": ${reason}`, { cause: error });
        }
        return true;
    }
}
