import type { OrderPaymentOption } from '@cafe-da-fisica/shared';
import type { MailMessage } from '../../../infrastructure/mail/mail.service.js';
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

const COLORS = {
    brand: '#6b4226',
    brandBackground: '#f9df76',
    text: '#333333',
    muted: '#777777',
};

function layout(content: string): string {
    return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="left" style="padding:24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#ffffff;border:2px solid ${COLORS.brandBackground};border-radius:8px;font-family:Arial,Helvetica,sans-serif;color:${COLORS.text};">
        <tr><td style="padding:20px 24px;background:${COLORS.brandBackground};border-radius:6px 6px 0 0;font-size:20px;font-weight:bold;color:${COLORS.brand};">
          Café da Física
        </td></tr>
        <tr><td style="padding:24px;font-size:15px;line-height:1.5;">${content}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
        html: layout(
            `<h1 style="margin:0 0 8px;font-size:22px;">Pedido #${order.id}</h1>` +
                `<p style="margin:0 0 16px;color:${COLORS.muted};">De ${escapeHtml(customer)}</p>` +
                details.html,
        ),
    };
}

export function orderConfirmationEmail(order: Order): EmailContent {
    const details = orderDetails(order);
    return {
        subject: `Recebemos seu pedido #${order.id}`,
        text: `Olá, ${order.customerName}! Recebemos seu pedido:\n\n${details.text}`,
        html: layout(
            `<p style="margin:0 0 16px;">Olá, ${escapeHtml(order.customerName)}! Recebemos seu pedido:</p>` +
                details.html,
        ),
    };
}
