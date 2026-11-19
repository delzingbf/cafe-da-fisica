import type { OrderDeliveryMethod, OrderPaymentOption, OrderStatus } from '@cafe-da-fisica/shared';

/** Texts shown for each order status, payment option and delivery method (e.g. in the report). */
export const ORDER_STATUS_LABELS = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
} satisfies Record<OrderStatus, string>;

export const ORDER_PAYMENT_LABELS = {
    pix: 'Pix',
    cash: 'Dinheiro',
} satisfies Record<OrderPaymentOption, string>;

export const ORDER_DELIVERY_LABELS = {
    delivery: 'Entrega',
    pickup: 'Retirada',
} satisfies Record<OrderDeliveryMethod, string>;
