import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { CatalogPage } from './CatalogPage';

const products: ProductResponse[] = [
    {
        id: 1,
        name: 'Café coado',
        price: 4,
        available: true,
        type: 'coffee',
        vegan: false,
        imageUrl: null,
    },
    {
        id: 2,
        name: 'Cookie de aveia',
        price: 7,
        available: true,
        type: 'sweet',
        vegan: true,
        imageUrl: null,
    },
];

function mockApi(body: unknown) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(body)));
}

describe('CatalogPage', () => {
    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('shows the products from the API', async () => {
        mockApi(products);

        render(<CatalogPage />);

        expect(await screen.findByText('Café coado')).toBeTruthy();
        expect(screen.getByText('Cookie de aveia')).toBeTruthy();
    });

    it('shows a message when there are no products', async () => {
        mockApi([]);

        render(<CatalogPage />);

        expect(await screen.findByText('Nenhum produto disponível.')).toBeTruthy();
    });

    it('shows an error when the API fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

        render(<CatalogPage />);

        expect(await screen.findByRole('alert')).toBeTruthy();
    });
});
