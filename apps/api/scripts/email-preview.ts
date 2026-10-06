// Sends the order emails for a sample order through Resend, so their layout can be checked
// without placing one. Needs RESEND_API_KEY in apps/api/.env.
// Usage (from apps/api): `npm run email:preview -- voce@example.com`
import 'dotenv/config';
import { Resend } from 'resend';
import {
    newOrderEmail,
    orderConfirmationEmail,
} from '../src/domain/orders/emails/order-email.templates.js';
import type { Order } from '../src/domain/orders/order.entity.js';

const to = process.argv[2];
if (!to) throw new Error('Usage: npm run email:preview -- voce@example.com');

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error('Set RESEND_API_KEY in apps/api/.env to send test emails.');

// Only the fields the templates read.
const order = {
    id: 42,
    customerName: "Thomas Tur'Bando",
    customerEmail: 'thomastb@example.com',
    paymentOption: 'pix',
    deliveryMethod: 'delivery',
    deliveryLocation: 'Sala 101, Instituto de Física',
    items: [
        { quantity: 2, unitPrice: 4, product: { name: 'Café coado' } },
        { quantity: 1, unitPrice: 8, product: { name: 'Bolo de cenoura' } },
        { quantity: 3, unitPrice: 6.5, product: { name: 'Pão de queijo' } },
    ],
} as unknown as Order;

const resend = new Resend(apiKey);
const from = process.env.EMAIL_FROM || 'Café da Física <onboarding@resend.dev>';

for (const email of [newOrderEmail(order), orderConfirmationEmail(order)]) {
    const subject = `[teste] ${email.subject}`;
    const { error } = await resend.emails.send({ from, to, ...email, subject });
    if (error) throw new Error(`Resend rejected "${subject}": ${error.name} (${error.message})`);
    console.log(`Sent "${subject}" to ${to}`);
}
