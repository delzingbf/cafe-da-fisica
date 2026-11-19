import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { CartProvider } from '../context/CartProvider';
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

function renderCatalog() {
    render(
        <CartProvider>
            <CatalogPage />
        </CartProvider>,
    );
}

function mockApi(body: unknown) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(body)));
}

describe('CatalogPage', () => {
    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        localStorage.clear();
    });

    it('shows the products from the API', async () => {
        mockApi(products);

        renderCatalog();

        expect(await screen.findByText('Café coado')).toBeTruthy();
        expect(screen.getByText('Cookie de aveia')).toBeTruthy();
    });

    it('shows a message when there are no products', async () => {
        mockApi([]);

        renderCatalog();

        expect(await screen.findByText('Nenhum produto disponível.')).toBeTruthy();
    });

    it('shows an error when the API fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

        renderCatalog();

        expect(await screen.findByRole('alert')).toBeTruthy();
    });

    it('switches between cards and list, and remembers the choice', async () => {
        mockApi(products);
        renderCatalog();
        await screen.findByText('Café coado');

        expect(screen.queryByRole('list')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Lista' }));

        const items = within(screen.getByRole('list')).getAllByRole('listitem');
        expect(items.map((item) => item.textContent)).toEqual([
            expect.stringContaining('Café coado'),
            expect.stringContaining('Cookie de aveia'),
        ]);
        expect(screen.getByRole('button', { name: 'Lista' }).getAttribute('aria-pressed')).toBe(
            'true',
        );

        // A new visit opens in the list view.
        cleanup();
        mockApi(products);
        renderCatalog();
        await screen.findByText('Café coado');
        expect(screen.getByRole('list')).toBeTruthy();
    });

    it('shows only the list view on small screens, without the toggle', async () => {
        localStorage.setItem('cafe_da_fisica_catalog_view', 'grid');
        vi.stubGlobal(
            'matchMedia',
            vi.fn((query: string) => ({
                matches: query === '(max-width: 600px)',
                addEventListener: () => {},
                removeEventListener: () => {},
            })),
        );
        mockApi(products);

        renderCatalog();
        await screen.findByText('Café coado');

        expect(screen.getByRole('list')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Cards' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Lista' })).toBeNull();
    });
});
