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
        mockApi({
            'GET /api/auth/me': () => Response.json(admin),
            'GET /api/products': products,
            'GET /api/settings': () =>
                Response.json({ orderNotificationEmail: 'pedidos@example.com' }),
        });

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

    it('updates the order notification email and changes the admin password', async () => {
        const fetchMock = mockApi({
            'GET /api/auth/me': () => Response.json(admin),
            'GET /api/products': products,
            'GET /api/settings': () =>
                Response.json({ orderNotificationEmail: 'pedidos@example.com' }),
            'PUT /api/settings/order-notification-email': () =>
                Response.json({ confirmationEmailSent: true }),
            'POST /api/auth/password': () => new Response(null, { status: 204 }),
        });
        window.history.replaceState(null, '', '/admin/configuracoes');
        render(<AdminApp />);

        const emailInput = await screen.findByLabelText('E-mail');
        fireEvent.change(emailInput, { target: { value: 'Novo@Exemplo.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar e-mail' }));

        expect(
            await screen.findByText(
                'E-mail atualizado. Enviamos uma confirmação ao endereço informado.',
            ),
        ).toBeTruthy();
        expect(fetchMock).toHaveBeenCalledWith(
            '/api/settings/order-notification-email',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ email: 'novo@exemplo.com' }),
            }),
        );

        fireEvent.change(screen.getByLabelText('Senha atual'), {
            target: { value: 'senha-atual' },
        });
        fireEvent.change(screen.getByLabelText('Nova senha'), {
            target: { value: 'senha-nova-segura' },
        });
        fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
            target: { value: 'senha-nova-segura' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

        expect(await screen.findByText('Senha alterada com sucesso.')).toBeTruthy();
        expect(fetchMock).toHaveBeenCalledWith(
            '/api/auth/password',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: 'senha-atual',
                    newPassword: 'senha-nova-segura',
                }),
            }),
        );
        expect(screen.getByText('Esta área é apenas visual e ainda não é funcional.')).toBeTruthy();
        expect(screen.queryByRole('button', { name: /aparência|estética/i })).toBeNull();
        expect(screen.getByRole('img', { name: 'Café da Física' })).toBeTruthy();
        expect(screen.getByText('#E2D9BC')).toBeTruthy();
        expect(screen.getByText('#80ABD7')).toBeTruthy();
        expect(
            screen.getByRole('img', { name: 'Logo da gestão atual do Café da Física' }),
        ).toBeTruthy();
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
