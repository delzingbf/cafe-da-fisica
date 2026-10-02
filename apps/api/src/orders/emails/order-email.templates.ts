import type { OrderPaymentOption } from '@cafe-da-fisica/shared';
import type { MailMessage } from '../../mail/mail.service.js';
import type { Order } from '../order.entity.js';

type EmailContent = Pick<MailMessage, 'subject' | 'html' | 'text'>;

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const PAYMENT_LABELS: Record<OrderPaymentOption, string> = { pix: 'Pix', cash: 'Dinheiro' };

// Customer input ends up in the HTML, so it must be escaped.
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function orderTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

// Expects `order.items[].product` to be loaded.
function orderDetails(order: Order) {
    const lines = order.items.map(
        (item) =>
            `${item.quantity}x ${item.product.name} — ${brl.format(item.unitPrice * item.quantity)}`,
    );
    const delivery =
        order.deliveryMethod === 'pickup'
            ? 'Retirada no local'
            : `Entrega em: ${order.deliveryLocation}`;
    const info = [
        `Total: ${brl.format(orderTotal(order))}`,
        `Pagamento: ${PAYMENT_LABELS[order.paymentOption]}`,
        delivery,
    ];

    return {
        text: [...lines, '', ...info].join('\n'),
        html:
            `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>` +
            info.map((l) => `<p>${escapeHtml(l)}</p>`).join(''),
    };
}

export function newOrderEmail(order: Order): EmailContent {
    const details = orderDetails(order);
    const customer = `${order.customerName} <${order.customerEmail}>`;
    return {
        subject: `Novo pedido #${order.id} — ${order.customerName}`,
        text: `Pedido #${order.id} de ${customer}\n\n${details.text}`,
        html: `<h1>Pedido #${order.id}</h1><p>De ${escapeHtml(customer)}</p>${details.html}`,
    };
}

export function orderConfirmationEmail(order: Order): EmailContent {
    const details = orderDetails(order);
    return {
        subject: `Recebemos seu pedido #${order.id}`,
        text: `Olá, ${order.customerName}! Recebemos seu pedido:\n\n${details.text}`,
        html: `<p>Olá, ${escapeHtml(order.customerName)}! Recebemos seu pedido:</p>${details.html}`,
    };
}
