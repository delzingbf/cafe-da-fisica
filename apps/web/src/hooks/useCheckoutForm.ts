import { useState } from 'react';
import type {
    CreateOrderRequest,
    OrderDeliveryMethod,
    OrderPaymentOption,
    OrderResponse,
    ProductsUnavailableError,
} from '@cafe-da-fisica/shared';
import { api, ApiError } from '../api/client';
import type { CartItem } from '../context/cartContext';
import { useCart } from './useCart';

export type CheckoutValues = {
    name: string;
    email: string;
    deliveryMethod: OrderDeliveryMethod;
    location: string;
    /** Value of the `datetime-local` input: local time, no zone (`2026-11-18T10:30`). */
    scheduledAt: string;
    payment: OrderPaymentOption;
};
export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

export type CheckoutStatus =
    | { kind: 'idle' }
    | { kind: 'submitting' }
    | { kind: 'success'; order: OrderResponse }
    | { kind: 'error'; message: string };

const INITIAL_VALUES: CheckoutValues = {
    name: '',
    email: '',
    deliveryMethod: 'pickup',
    location: '',
    scheduledAt: '',
    payment: 'cash',
};

export function validateCheckout(values: CheckoutValues, now = new Date()): CheckoutErrors {
    const errors: CheckoutErrors = {};
    if (!values.name.trim()) errors.name = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
        errors.email = 'Informe um e-mail válido.';
    if (values.deliveryMethod === 'delivery' && !values.location.trim())
        errors.location = 'Informe o local de entrega.';
    const date = new Date(values.scheduledAt);
    if (!values.scheduledAt || !Number.isFinite(date.getTime()) || date <= now)
        errors.scheduledAt = 'Escolha uma data e um horário futuros.';

    return errors;
}

/** Body of `POST /orders`. Expects values that passed `validateCheckout`. */
export function buildOrderRequest(values: CheckoutValues, cart: CartItem[]): CreateOrderRequest {
    return {
        customerName: values.name.trim(),
        customerEmail: values.email.trim(),
        paymentOption: values.payment,
        deliveryMethod: values.deliveryMethod,
        deliveryLocation: values.deliveryMethod === 'delivery' ? values.location.trim() : undefined,
        // The input has no zone and `new Date` reads it as the browser's local time, which is
        // what the customer meant; the API gets an unambiguous UTC instant.
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        items: cart.map(({ product, quantity }) => ({ productId: product.id, quantity })),
    };
}

function isProductsUnavailable(body: unknown): body is ProductsUnavailableError {
    return (
        typeof body === 'object' &&
        body !== null &&
        Array.isArray((body as ProductsUnavailableError).unavailableProductIds)
    );
}

/** A message the customer can act on, for an order the API did not accept. */
export function checkoutErrorMessage(error: unknown, cart: CartItem[]): string {
    if (!(error instanceof ApiError)) {
        return 'Não foi possível enviar o pedido. Verifique sua conexão e tente novamente.';
    }
    if (isProductsUnavailable(error.body)) {
        const ids = new Set(error.body.unavailableProductIds);
        const names = cart.filter(({ product }) => ids.has(product.id)).map((i) => i.product.name);
        if (names.length > 0) {
            return `Não temos mais disponível: ${names.join(', ')}. Remova do carrinho e tente novamente.`;
        }
    }
    if (error.status >= 400 && error.status < 500) {
        return 'Não foi possível finalizar o pedido. Confira os dados e tente novamente.';
    }
    return 'Não foi possível enviar o pedido agora. Tente novamente em instantes.';
}

export function useCheckoutForm() {
    const { cart, clearCart } = useCart();
    const [values, setValues] = useState<CheckoutValues>(INITIAL_VALUES);
    const [errors, setErrors] = useState<CheckoutErrors>({});
    const [status, setStatus] = useState<CheckoutStatus>({ kind: 'idle' });

    function setField<K extends keyof CheckoutValues>(field: K, value: CheckoutValues[K]) {
        setValues((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
        setStatus((previous) => (previous.kind === 'error' ? { kind: 'idle' } : previous));
    }

    /** Validates and sends the order. Resolves to `false` when the fields have errors. */
    async function submit(): Promise<boolean> {
        if (status.kind === 'submitting') return true;

        const nextErrors = validateCheckout(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return false;

        setStatus({ kind: 'submitting' });
        try {
            const order = await api.post<OrderResponse>('/orders', buildOrderRequest(values, cart));
            setStatus({ kind: 'success', order });
            clearCart();
        } catch (error) {
            setStatus({ kind: 'error', message: checkoutErrorMessage(error, cart) });
        }
        return true;
    }

    /** Starts a new order, keeping who is ordering. */
    function reset() {
        setValues((previous) => ({
            ...INITIAL_VALUES,
            name: previous.name,
            email: previous.email,
        }));
        setErrors({});
        setStatus({ kind: 'idle' });
    }

    return { values, errors, status, setField, submit, reset };
}
