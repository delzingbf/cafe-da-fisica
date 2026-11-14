import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { OrderReportResponse } from '@cafe-da-fisica/shared';
import { AdminReportPage } from './AdminReportPage';

const report: OrderReportResponse = {
    history: {
        from: '2026-10-17T12:00:00.000Z',
        to: '2026-11-14T12:00:00.000Z',
        orders: [
            {
                id: 3,
                customerName: 'Ana',
                status: 'cancelled',
                paymentOption: 'cash',
                deliveryMethod: 'pickup',
                createdAt: '2026-11-13T12:00:00.000Z',
                total: 40,
                items: [{ productId: 2, productName: 'Bolo', quantity: 5, unitPrice: 8 }],
            },
            {
                id: 2,
                customerName: 'Bruno',
                status: 'pending',
                paymentOption: 'pix',
                deliveryMethod: 'delivery',
                createdAt: '2026-11-12T12:00:00.000Z',
                total: 9,
                items: [{ productId: 1, productName: 'Café coado', quantity: 2, unitPrice: 4.5 }],
            },
        ],
    },
    lastWeek: {
        from: '2026-11-07T12:00:00.000Z',
        to: '2026-11-14T12:00:00.000Z',
        ordersCount: 1,
        products: [{ productId: 1, productName: 'Café coado', quantity: 2, revenue: 9 }],
        totalRevenue: 9,
    },
};

/** `Intl` puts a non-breaking space after "R$"; normalize it to compare plain text. */
const plain = (text: string | null) => (text ?? '').replace(/ /g, ' ');

function mockFetch(response: Response) {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('AdminReportPage', () => {
    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('shows the title right away, then the last week summary and the 4-week history', async () => {
        const fetchMock = mockFetch(Response.json(report));

        render(<AdminReportPage />);

        expect(screen.getByRole('heading', { name: 'Relatório' })).toBeTruthy();
        expect(screen.getByRole('status').textContent).toBe('Carregando relatório…');

        const lastWeek = await screen.findByRole('region', { name: 'Última semana' });
        expect(fetchMock.mock.calls[0][0]).toBe('/api/orders/report');
        expect(
            plain(within(lastWeek).getByText('Total arrecadado').nextSibling?.textContent ?? ''),
        ).toBe('R$ 9,00');
        const productRow = within(lastWeek).getByRole('row', { name: /Café coado/ });
        expect(plain(productRow.textContent)).toBe('Café coado2R$ 9,00');

        const history = screen.getByRole('region', { name: 'Histórico das últimas 4 semanas' });
        // One header row plus one row per order, in the order the API sent them.
        const rows = within(history).getAllByRole('row');
        expect(rows).toHaveLength(3);
        expect(rows[1].textContent).toContain('#3');
        expect(rows[1].textContent).toContain('Cancelado');
        expect(rows[2].textContent).toContain('Bruno');
        expect(rows[2].textContent).toContain('2x Café coado');
        expect(rows[2].textContent).toContain('Pendente');
    });

    it('opens the print dialog (which can save a PDF) once the report is loaded', async () => {
        mockFetch(Response.json(report));
        const print = vi.spyOn(window, 'print').mockImplementation(() => {});

        render(<AdminReportPage />);

        const button = screen.getByRole('button', { name: 'Imprimir / Salvar PDF' });
        expect((button as HTMLButtonElement).disabled).toBe(true);

        await screen.findByRole('region', { name: 'Última semana' });
        expect((button as HTMLButtonElement).disabled).toBe(false);
        fireEvent.click(button);

        expect(print).toHaveBeenCalledOnce();
    });

    it('explains when there are no orders', async () => {
        mockFetch(
            Response.json({
                history: { ...report.history, orders: [] },
                lastWeek: { ...report.lastWeek, ordersCount: 0, products: [], totalRevenue: 0 },
            } satisfies OrderReportResponse),
        );

        render(<AdminReportPage />);

        expect(await screen.findByText('Nenhuma encomenda nas últimas 4 semanas.')).toBeTruthy();
        expect(screen.getByText('Nenhum produto foi encomendado na última semana.')).toBeTruthy();
    });

    it('tells the admin when the session expired', async () => {
        mockFetch(new Response(null, { status: 401 }));

        render(<AdminReportPage />);

        expect((await screen.findByRole('alert')).textContent).toBe(
            'Sua sessão expirou. Entre novamente para ver o relatório.',
        );
    });

    it('shows a generic error when the report cannot be loaded', async () => {
        mockFetch(new Response(null, { status: 500 }));

        render(<AdminReportPage />);

        expect((await screen.findByRole('alert')).textContent).toContain(
            'Não foi possível carregar o relatório.',
        );
        expect(screen.getByRole('heading', { name: 'Relatório' })).toBeTruthy();
    });
});
