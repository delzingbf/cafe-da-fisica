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

// UC6 - Gerar Relatório. Dates are ISO 8601 strings (JSON has no Date type).

/** One order of the history, with its lines. `total` is the sum of `unitPrice * quantity`. */
export interface OrderReportOrder {
    id: number;
    customerName: string;
    status: OrderStatus;
    paymentOption: OrderPaymentOption;
    deliveryMethod: OrderDeliveryMethod;
    createdAt: string;
    total: number;
    items: Array<{
        productId: number;
        productName: string;
        quantity: number;
        unitPrice: number;
    }>;
}

/** A product ordered in the last week: units sold and the money they brought in. */
export interface OrderReportProduct {
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
}

export interface OrderReportResponse {
    /** Every order of the last 4 weeks (28 days), newest first, cancelled ones included. */
    history: {
        from: string;
        to: string;
        orders: OrderReportOrder[];
    };
    /** Last 7 days, cancelled orders left out of the products and of the total. */
    lastWeek: {
        from: string;
        to: string;
        ordersCount: number;
        products: OrderReportProduct[];
        totalRevenue: number;
    };
}
