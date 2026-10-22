import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AdminResponse } from '@cafe-da-fisica/shared';
import AdminApp from './AdminApp';

const admin: AdminResponse = { id: 1, email: 'admin@example.com' };

type Route = () => Response;

/** Answers `fetch` by "METHOD /path"; anything else is a 404. */
function mockApi(routes: Record<string, Route>) {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
        const route = routes[`${init?.method ?? 'GET'} ${url}`];
        return Promise.resolve(route ? route() : new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

const products: Route = () => Response.json([]);
const unauthorized: Route = () => new Response(null, { status: 401 });

function fillLogin(email: string, password: string) {
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('AdminApp', () => {
    beforeAll(() => {
        // jsdom has no modal dialogs; `open` is enough for the dialog to be in the accessibility tree.
        HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
            this.open = true;
        };
        HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
            this.open = false;
            this.dispatchEvent(new Event('close'));
        };
        // Called on every page change; jsdom only logs "not implemented".
        window.scrollTo = () => {};
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        localStorage.clear();
        window.history.replaceState(null, '', '/');
    });

    const loggedIn = () =>
        mockApi({ 'GET /api/auth/me': () => Response.json(admin), 'GET /api/products': products });

    it('shows the login card, and no admin actions, without a session', async () => {
        mockApi({ 'GET /api/auth/me': unauthorized, 'GET /api/products': products });

        render(<AdminApp />);

        expect(await screen.findByRole('dialog', { name: 'Acesso do administrador' })).toBeTruthy();
        expect(screen.getByText('Painel Administrador')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Adicionar Produto' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Abrir menu' })).toBeNull();
    });

    it('navigates between admin pages from the side menu', async () => {
        loggedIn();
        render(<AdminApp />);

        fireEvent.click(await screen.findByRole('button', { name: 'Abrir menu' }));
        const menu = screen.getByRole('dialog', { name: 'Menu' });
        expect(
            within(menu).getByRole('link', { name: 'Catálogo' }).getAttribute('aria-current'),
        ).toBe('page');

        fireEvent.click(within(menu).getByRole('link', { name: 'Relatório' }));

        expect(screen.getByRole('heading', { name: 'Relatório' })).toBeTruthy();
        expect(window.location.pathname).toBe('/admin/relatorio');
        expect(screen.queryByRole('dialog')).toBeNull();
        // "Adicionar Produto" belongs to the catalog only.
        expect(screen.queryByRole('button', { name: 'Adicionar Produto' })).toBeNull();
    });

    it('opens the page in the URL and follows the back button', async () => {
        window.history.replaceState(null, '', '/admin/configuracoes');
        loggedIn();
        render(<AdminApp />);

        expect(await screen.findByRole('heading', { name: 'Configurações' })).toBeTruthy();

        act(() => {
            window.history.replaceState(null, '', '/admin');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        expect(await screen.findByRole('button', { name: 'Adicionar Produto' })).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Configurações' })).toBeNull();
    });

    it('skips the login when a session already exists', async () => {
        mockApi({ 'GET /api/auth/me': () => Response.json(admin), 'GET /api/products': products });

        render(<AdminApp />);

        expect(await screen.findByRole('button', { name: 'Adicionar Produto' })).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('logs in with email and password', async () => {
        const fetchMock = mockApi({
            'GET /api/auth/me': unauthorized,
            'GET /api/products': products,
            'POST /api/auth/login': () => Response.json(admin),
        });
        render(<AdminApp />);
        await screen.findByRole('dialog');

        fillLogin('admin@example.com', 'segredo');

        expect(await screen.findByRole('button', { name: 'Adicionar Produto' })).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(fetchMock).toHaveBeenCalledWith(
            '/api/auth/login',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'admin@example.com', password: 'segredo' }),
            }),
        );
    });

    it.each([
        [401, 'E-mail ou senha incorretos.'],
        [429, 'Muitas tentativas. Aguarde um minuto e tente de novo.'],
    ])('explains a failed login (%i) and clears the password', async (status, message) => {
        mockApi({
            'GET /api/auth/me': unauthorized,
            'GET /api/products': products,
            'POST /api/auth/login': () => new Response(null, { status }),
        });
        render(<AdminApp />);
        await screen.findByRole('dialog');

        fillLogin('admin@example.com', 'errada');

        expect((await screen.findByRole('alert')).textContent).toBe(message);
        expect((screen.getByLabelText('Senha') as HTMLInputElement).value).toBe('');
        expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('logs out back to the login card', async () => {
        mockApi({
            'GET /api/auth/me': () => Response.json(admin),
            'GET /api/products': products,
            'POST /api/auth/logout': () => new Response(null, { status: 204 }),
        });
        render(<AdminApp />);

        fireEvent.click(await screen.findByRole('button', { name: 'Sair' }));

        await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
        expect(screen.queryByRole('button', { name: 'Adicionar Produto' })).toBeNull();
    });
});
