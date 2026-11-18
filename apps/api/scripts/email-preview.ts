// Sends the order emails for a sample order through the configured SMTP server (MailService), so
// their layout can be checked without placing one. Needs SMTP_USER and SMTP_PASSWORD in
// apps/api/.env. Usage (from apps/api): `npm run email:preview -- voce@example.com`
import 'dotenv/config';
import type { ConfigService } from '@nestjs/config';
import {
    newOrderEmail,
    orderConfirmationEmail,
} from '../src/domain/orders/emails/order-email.templates.js';
import type { Order } from '../src/domain/orders/order.entity.js';
import { type Env, validateEnv } from '../src/infrastructure/config/env.js';
import { MailService } from '../src/infrastructure/mail/mail.service.js';

const to = process.argv[2];
if (!to) throw new Error('Usage: npm run email:preview -- voce@example.com');

const env = validateEnv(process.env);
if (!env.SMTP_USER) {
    throw new Error('Set SMTP_USER and SMTP_PASSWORD in apps/api/.env to send test emails.');
}
const mail = new MailService({
    get: (key: keyof Env) => env[key],
} as ConfigService<Env, true>);

// Only the fields the templates read.
const order = {
    id: 42,
    customerName: 'Mateus Pletsch',
    customerEmail: 'mateusp@example.com',
    paymentOption: 'pix',
    deliveryMethod: 'delivery',
    deliveryLocation: 'Sala 101, Instituto de Física',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    items: [
        { quantity: 2, unitPrice: 4, product: { name: 'Térmica de café' } },
        { quantity: 1, unitPrice: 8, product: { name: 'Bolo de cenoura' } },
        { quantity: 3, unitPrice: 6.5, product: { name: 'Pão de queijo' } },
    ],
} as unknown as Order;

for (const email of [newOrderEmail(order), orderConfirmationEmail(order)]) {
    const subject = `[teste] ${email.subject}`;
    await mail.send({ to, ...email, subject });
    console.log(`Sent "${subject}" to ${to}`);
}
