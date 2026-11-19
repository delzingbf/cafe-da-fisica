import type { Order } from '../order.entity.js';
import { newOrderEmail, orderConfirmationEmail } from './order-email.templates.js';

// Only the fields the templates read.
function sampleOrder(overrides: Partial<Order> = {}): Order {
    return {
        id: 7,
        customerName: 'Ana <script>',
        customerEmail: 'ana@example.com',
        paymentOption: 'pix',
        deliveryMethod: 'delivery',
        deliveryLocation: 'Prédio 43164, sala 203',
        // 13:30 UTC is 10:30 in Porto Alegre.
        scheduledAt: new Date('2030-01-15T13:30:00Z'),
        items: [{ quantity: 2, unitPrice: 4.5, product: { name: 'Café coado' } }],
        ...overrides,
    } as unknown as Order;
}

describe('order emails', () => {
    it.each([
        ['new order', newOrderEmail],
        ['confirmation', orderConfirmationEmail],
    ])('the %s email shows the scheduled date in the café time zone', (_, template) => {
        const email = template(sampleOrder());

        expect(email.text).toContain('Data e horário: terça-feira, 15 de janeiro de 2030 às 10:30');
        expect(email.html).toContain('15 de janeiro de 2030 às 10:30');
    });

    it('lists the items, total, payment and delivery place', () => {
        const { text } = orderConfirmationEmail(sampleOrder());

        expect(text).toContain('2x Café coado');
        expect(text).toMatch(/Total: R\$\s9,00/);
        expect(text).toContain('Pagamento: Pix');
        expect(text).toContain('Entrega em: Prédio 43164, sala 203');
    });

    it('escapes customer input in the HTML', () => {
        const { html } = newOrderEmail(sampleOrder());

        expect(html).toContain('Ana &lt;script&gt;');
        expect(html).not.toContain('<script>');
    });
});
