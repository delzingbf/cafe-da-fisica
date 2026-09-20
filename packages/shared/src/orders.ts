// Order enums. Mirrored as PostgreSQL enum types by the API (see apps/api/src/orders/*.entity.ts).

export const ORDER_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_PAYMENT_OPTIONS = ['pix', 'cash'] as const;
export type OrderPaymentOption = (typeof ORDER_PAYMENT_OPTIONS)[number];

export const ORDER_DELIVERY_METHODS = ['delivery', 'pickup'] as const;
export type OrderDeliveryMethod = (typeof ORDER_DELIVERY_METHODS)[number];
