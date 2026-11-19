import { describe, expect, it } from 'vitest';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ApiError } from '../api/client';
import type { CartItem } from '../context/cartContext';
import {
    buildOrderRequest,
    checkoutErrorMessage,
    validateCheckout,
    type CheckoutValues,
} from './useCheckoutForm';

function product(id: number, name: string): ProductResponse {
    return { id, name, price: 5, available: true, type: 'other', vegan: false, imageUrl: null };
}

const cart: CartItem[] = [
    { product: product(1, 'Café coado'), quantity: 2 },
    { product: product(2, 'Bolo de cenoura'), quantity: 1 },
];

const values: CheckoutValues = {
    name: ' Ana ',
    email: ' ana@example.com ',
    deliveryMethod: 'delivery',
    location: ' Prédio 43164, sala 203 ',
    scheduledAt: '2030-01-15T10:30',
    payment: 'pix',
};

describe('validateCheckout', () => {
    const now = new Date('2030-01-15T09:00');

    it('accepts complete values', () => {
        expect(validateCheckout(values, now)).toEqual({});
    });

    it('requires a future date and time', () => {
        expect(
            validateCheckout({ ...values, scheduledAt: '2030-01-15T08:00' }, now),
        ).toHaveProperty('scheduledAt');
        expect(validateCheckout({ ...values, scheduledAt: '' }, now)).toHaveProperty('scheduledAt');
    });

    it('requires a location only for deliveries', () => {
        expect(validateCheckout({ ...values, location: '' }, now)).toHaveProperty('location');
        expect(
            validateCheckout({ ...values, deliveryMethod: 'pickup', location: '' }, now),
        ).toEqual({});
    });
});

describe('buildOrderRequest', () => {
    it('maps the form and cart to the API body', () => {
        expect(buildOrderRequest(values, cart)).toEqual({
            customerName: 'Ana',
            customerEmail: 'ana@example.com',
            paymentOption: 'pix',
            deliveryMethod: 'delivery',
            deliveryLocation: 'Prédio 43164, sala 203',
            scheduledAt: new Date('2030-01-15T10:30').toISOString(),
            items: [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 },
            ],
        });
    });

    it('leaves out the location of a pickup', () => {
        const body = buildOrderRequest({ ...values, deliveryMethod: 'pickup' }, cart);

        expect(body.deliveryLocation).toBeUndefined();
    });
});

describe('checkoutErrorMessage', () => {
    it('names the cart items that are no longer available', () => {
        const error = new ApiError(400, 'failed', { statusCode: 400, unavailableProductIds: [2] });

        expect(checkoutErrorMessage(error, cart)).toContain('Bolo de cenoura');
    });

    it('asks to review the data on other client errors', () => {
        expect(checkoutErrorMessage(new ApiError(400, 'failed'), cart)).toMatch(/Confira os dados/);
    });

    it('suggests trying again on server and network errors', () => {
        expect(checkoutErrorMessage(new ApiError(500, 'failed'), cart)).toMatch(/Tente novamente/);
        expect(checkoutErrorMessage(new TypeError('Failed to fetch'), cart)).toMatch(/conexão/);
    });
});
