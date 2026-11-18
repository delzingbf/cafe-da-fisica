import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminOrdersPage } from './AdminOrdersPage';

const order = {
    id: 3,
    customerName: 'Ana',
    status: 'pending',
    paymentOption: 'cash',
    deliveryMethod: 'pickup',
    createdAt: '2026-11-17T12:00:00Z',
    total: 16,
    items: [{ productId: 1, productName: 'Bolo', quantity: 2, unitPrice: 8 }],
};

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('AdminOrdersPage', () => {
    it('persists status changes and keeps the old status on failure', async () => {
        const fetch = vi
            .fn()
            .mockResolvedValueOnce(Response.json([order]))
            .mockResolvedValueOnce(new Response(null, { status: 204 }))
            .mockResolvedValueOnce(new Response(null, { status: 500 }));
        vi.stubGlobal('fetch', fetch);
        render(<AdminOrdersPage />);
        const select = await screen.findByRole('combobox', { name: 'Status do pedido #3' });
        fireEvent.change(select, { target: { value: 'confirmed' } });
        await screen.findByText('Status do pedido #3 atualizado.');
        expect(fetch.mock.calls[1][0]).toBe('/api/orders/3/status');
        expect(fetch.mock.calls[1][1]).toMatchObject({
            method: 'PATCH',
            body: JSON.stringify({ status: 'confirmed' }),
        });
        expect((select as HTMLSelectElement).value).toBe('confirmed');
        await waitFor(() => expect((select as HTMLSelectElement).disabled).toBe(false));
        fireEvent.change(select, { target: { value: 'cancelled' } });
        await screen.findByRole('alert');
        expect((select as HTMLSelectElement).value).toBe('confirmed');
    });

    it('only removes an order after confirmation and successful deletion', async () => {
        const fetch = vi
            .fn()
            .mockResolvedValueOnce(Response.json([order]))
            .mockResolvedValueOnce(new Response(null, { status: 500 }))
            .mockResolvedValueOnce(new Response(null, { status: 204 }));
        vi.stubGlobal('fetch', fetch);
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        render(<AdminOrdersPage />);
        const button = await screen.findByRole('button', { name: 'Excluir pedido #3' });
        fireEvent.click(button);
        expect(fetch).toHaveBeenCalledTimes(1);
        confirm.mockReturnValue(true);
        fireEvent.click(button);
        await screen.findByRole('alert');
        expect(screen.getByText('Ana')).toBeTruthy();
        await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
        fireEvent.click(button);
        await screen.findByText('Pedido #3 excluído.');
        expect(screen.queryByText('Ana')).toBeNull();
        expect(fetch.mock.calls[2][1]).toMatchObject({ method: 'DELETE' });
    });

    it('explains expired sessions', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
        render(<AdminOrdersPage />);
        expect((await screen.findByRole('alert')).textContent).toContain('Sua sessão expirou');
    });
});
