// Order enums. Mirrored as PostgreSQL enum types by the API (see apps/api/src/domain/orders/*.entity.ts).

export const ORDER_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_PAYMENT_OPTIONS = ['pix', 'cash'] as const;
export type OrderPaymentOption = (typeof ORDER_PAYMENT_OPTIONS)[number];

export const ORDER_DELIVERY_METHODS = ['delivery', 'pickup'] as const;
export type OrderDeliveryMethod = (typeof ORDER_DELIVERY_METHODS)[number];

export interface OrderResponse {
    id: number;
    status: OrderStatus;
    total: number;
}

export interface CreateOrderItemRequest {
    productId: number;
    quantity: number;
}

/** Body of `POST /orders`. */
export interface CreateOrderRequest {
    customerName: string;
    customerEmail: string;
    paymentOption: OrderPaymentOption;
    deliveryMethod: OrderDeliveryMethod;
    /** Required when `deliveryMethod` is `'delivery'`, ignored otherwise. */
    deliveryLocation?: string;
    /** When the customer wants the order, as an ISO 8601 string. Must be in the future. */
    scheduledAt: string;
    items: CreateOrderItemRequest[];
}

/** Body of the 400 response when some ordered products can no longer be ordered. */
export interface ProductsUnavailableError {
    statusCode: 400;
    message: string;
    unavailableProductIds: number[];
}
