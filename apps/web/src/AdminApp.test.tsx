import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AdminResponse, ProductResponse } from '@cafe-da-fisica/shared';
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

    describe('removing products', () => {
        const brownie: ProductResponse = {
            id: 7,
            name: 'Brownie',
            price: 8,
            available: true,
            type: 'sweet',
            vegan: false,
            imageUrl: null,
        };
        const bolo: ProductResponse = { ...brownie, id: 3, name: 'Bolo de cenoura' };

        /** A fake API that really moves products between the menu and the removed list. */
        function catalogApi() {
            let menu = [bolo, brownie];
            let removed: ProductResponse[] = [];
            const move = (id: number, toMenu: boolean) => {
                const product = [...menu, ...removed].find((p) => p.id === id)!;
                menu = menu.filter((p) => p.id !== id);
                removed = removed.filter((p) => p.id !== id);
                (toMenu ? menu : removed).push(product);
                return new Response(null, { status: 204 });
            };
            return mockApi({
                'GET /api/auth/me': () => Response.json(admin),
                'GET /api/products': () => Response.json(menu),
                'GET /api/products/archived': () => Response.json(removed),
                'DELETE /api/products/7': () => move(7, false),
                'POST /api/products/7/restore': () => move(7, true),
            });
        }

        it('removes a product after confirming, and restores it from "Mostrar removidos"', async () => {
            const fetchMock = catalogApi();
            render(<AdminApp />);

            fireEvent.click(await screen.findByRole('button', { name: 'Remover Brownie' }));
            const dialog = screen.getByRole('dialog', { name: 'Remover produto' });
            expect(within(dialog).getByText('Remover “Brownie” do cardápio?')).toBeTruthy();
            fireEvent.click(within(dialog).getByRole('button', { name: 'Remover' }));

            await waitFor(() =>
                expect(screen.queryByRole('button', { name: 'Brownie' })).toBeNull(),
            );
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/products/7',
                expect.objectContaining({ method: 'DELETE' }),
            );
            expect(screen.getByText('Brownie removido do cardápio')).toBeTruthy();
            expect(screen.queryByRole('dialog')).toBeNull();
            expect(screen.getByRole('button', { name: 'Bolo de cenoura' })).toBeTruthy();

            fireEvent.click(screen.getByRole('button', { name: 'Mostrar removidos' }));
            expect(await screen.findByRole('button', { name: 'Brownie' })).toBeTruthy();
            expect(screen.getByText('Removido')).toBeTruthy();

            fireEvent.click(screen.getByRole('button', { name: 'Restaurar' }));

            await waitFor(() => expect(screen.queryByText('Removido')).toBeNull());
            expect(screen.getByRole('button', { name: 'Brownie' })).toBeTruthy();
            expect(screen.getByText('Brownie restaurado no cardápio')).toBeTruthy();
        });

        it('keeps the product when the removal is cancelled', async () => {
            const fetchMock = catalogApi();
            render(<AdminApp />);

            fireEvent.click(await screen.findByRole('button', { name: 'Remover Brownie' }));
            fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

            expect(screen.queryByRole('dialog')).toBeNull();
            expect(screen.getByRole('button', { name: 'Brownie' })).toBeTruthy();
            expect(fetchMock).not.toHaveBeenCalledWith('/api/products/7', expect.anything());
        });

        it('explains a failed removal and keeps the dialog open', async () => {
            mockApi({
                'GET /api/auth/me': () => Response.json(admin),
                'GET /api/products': () => Response.json([brownie]),
                'DELETE /api/products/7': () => new Response(null, { status: 500 }),
            });
            render(<AdminApp />);

            fireEvent.click(await screen.findByRole('button', { name: 'Remover Brownie' }));
            fireEvent.click(screen.getByRole('button', { name: 'Remover' }));

            expect((await screen.findByRole('alert')).textContent).toBe(
                'Não foi possível remover. Verifique sua conexão e tente de novo.',
            );
            expect(screen.getByRole('dialog', { name: 'Remover produto' })).toBeTruthy();
            expect(screen.getByRole('button', { name: 'Brownie' })).toBeTruthy();
        });
    });

    describe('creating and editing products', () => {
        const brownie: ProductResponse = {
            id: 7,
            name: 'Brownie',
            price: 8,
            available: true,
            type: 'sweet',
            vegan: false,
            imageUrl: 'https://example.com/brownie.png',
        };

        /** A fake API that keeps the products it is sent. */
        function productsApi(overrides: Record<string, Route> = {}) {
            let menu: ProductResponse[] = [brownie];
            const body = (init?: RequestInit) => JSON.parse(String(init?.body)) as object;
            const fetchMock = mockApi({
                'GET /api/auth/me': () => Response.json(admin),
                'GET /api/products': () => Response.json(menu),
                ...overrides,
            });
            const routes = fetchMock.getMockImplementation()!;
            fetchMock.mockImplementation((url: string, init?: RequestInit) => {
                const key = `${init?.method ?? 'GET'} ${url}`;
                if (!overrides[key] && key === 'POST /api/products') {
                    const created = { ...brownie, ...body(init), id: 8 } as ProductResponse;
                    menu = [...menu, created];
                    return Promise.resolve(Response.json(created, { status: 201 }));
                }
                if (!overrides[key] && key === 'PATCH /api/products/7') {
                    menu = menu.map((p) => (p.id === 7 ? { ...p, ...body(init) } : p));
                    return Promise.resolve(Response.json(menu.find((p) => p.id === 7)));
                }
                return routes(url, init);
            });
            return fetchMock;
        }

        async function openEditForm() {
            fireEvent.click(await screen.findByRole('button', { name: 'Brownie' }));
            fireEvent.click(screen.getByRole('button', { name: 'Editar Produto' }));
            return screen.getByRole('dialog', { name: 'Editar Produto' });
        }

        it('creates a product from "Adicionar Produto"', async () => {
            const fetchMock = productsApi();
            render(<AdminApp />);

            fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Produto' }));
            const form = screen.getByRole('dialog', { name: 'Adicionar Novo Produto' });
            fireEvent.change(within(form).getByLabelText('Nome'), {
                target: { value: ' Pão de queijo ' },
            });
            fireEvent.change(within(form).getByLabelText('Preço (R$)'), {
                target: { value: '4,50' },
            });
            fireEvent.change(within(form).getByLabelText('Tipo'), { target: { value: 'savory' } });
            fireEvent.click(within(form).getByLabelText('Produto Vegano'));
            fireEvent.click(within(form).getByRole('button', { name: 'Criar Produto' }));

            expect(await screen.findByText('Pão de queijo adicionado ao cardápio')).toBeTruthy();
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/products',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'Pão de queijo',
                        price: 4.5,
                        type: 'savory',
                        vegan: true,
                        available: true,
                        imageUrl: null,
                    }),
                }),
            );
            expect(screen.queryByRole('dialog')).toBeNull();
            expect(await screen.findByRole('button', { name: 'Pão de queijo' })).toBeTruthy();
        });

        it('rejects a price with more than two decimals before sending it', async () => {
            const fetchMock = productsApi();
            render(<AdminApp />);

            fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Produto' }));
            const form = screen.getByRole('dialog', { name: 'Adicionar Novo Produto' });
            fireEvent.change(within(form).getByLabelText('Nome'), { target: { value: 'Bolo' } });
            fireEvent.change(within(form).getByLabelText('Preço (R$)'), {
                target: { value: '4,505' },
            });
            fireEvent.change(within(form).getByLabelText('Tipo'), { target: { value: 'sweet' } });
            fireEvent.click(within(form).getByRole('button', { name: 'Criar Produto' }));

            expect(within(form).getByRole('alert').textContent).toBe(
                'Use só números e até duas casas decimais, como 4,50.',
            );
            expect(fetchMock).not.toHaveBeenCalledWith(
                '/api/products',
                expect.objectContaining({ method: 'POST' }),
            );
        });

        it('edits a product, starting from its current values', async () => {
            const fetchMock = productsApi();
            render(<AdminApp />);

            const form = await openEditForm();
            const value = (label: string) =>
                (within(form).getByLabelText(label) as HTMLInputElement).value;
            expect(value('Nome')).toBe('Brownie');
            expect(value('Preço (R$)')).toBe('8,00');
            expect(value('Tipo')).toBe('sweet');
            expect(value('URL da Imagem')).toBe('https://example.com/brownie.png');

            fireEvent.change(within(form).getByLabelText('Preço (R$)'), {
                target: { value: '9.5' },
            });
            fireEvent.click(within(form).getByLabelText('Disponível para encomenda'));
            fireEvent.change(within(form).getByLabelText('URL da Imagem'), {
                target: { value: '' },
            });
            fireEvent.click(within(form).getByRole('button', { name: 'Salvar Alterações' }));

            expect(await screen.findByText('Brownie atualizado')).toBeTruthy();
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/products/7',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({
                        name: 'Brownie',
                        price: 9.5,
                        type: 'sweet',
                        vegan: false,
                        available: false,
                        imageUrl: null,
                    }),
                }),
            );
            expect(screen.queryByRole('dialog')).toBeNull();
        });

        it('explains a failed save and keeps the form open', async () => {
            productsApi({ 'PATCH /api/products/7': () => new Response(null, { status: 400 }) });
            render(<AdminApp />);

            const form = await openEditForm();
            fireEvent.click(within(form).getByRole('button', { name: 'Salvar Alterações' }));

            expect((await within(form).findByRole('alert')).textContent).toBe(
                'Confira os dados do produto e tente de novo.',
            );
            expect(screen.getByRole('dialog', { name: 'Editar Produto' })).toBeTruthy();
        });

        it('asks for the login again when the session expired meanwhile', async () => {
            let sessionValid = true;
            productsApi({
                'GET /api/auth/me': () =>
                    sessionValid ? Response.json(admin) : new Response(null, { status: 401 }),
                'PATCH /api/products/7': () => {
                    sessionValid = false;
                    return new Response(null, { status: 401 });
                },
            });
            render(<AdminApp />);

            const form = await openEditForm();
            fireEvent.click(within(form).getByRole('button', { name: 'Salvar Alterações' }));

            expect(
                await screen.findByRole('dialog', { name: 'Acesso do administrador' }),
            ).toBeTruthy();
            expect(screen.queryByRole('button', { name: 'Adicionar Produto' })).toBeNull();
        });
    });

    it('keeps the session after a wrong current password', async () => {
        const fetchMock = mockApi({
            'GET /api/auth/me': () => Response.json(admin),
            'GET /api/products': products,
            'GET /api/settings': () =>
                Response.json({ orderNotificationEmail: 'pedidos@example.com' }),
            'POST /api/auth/password': unauthorized,
        });
        window.history.replaceState(null, '', '/admin/configuracoes');
        render(<AdminApp />);

        fireEvent.change(await screen.findByLabelText('Senha atual'), {
            target: { value: 'errada' },
        });
        fireEvent.change(screen.getByLabelText('Nova senha'), {
            target: { value: 'senha-nova-segura' },
        });
        fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
            target: { value: 'senha-nova-segura' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

        expect((await screen.findByRole('alert')).textContent).toBe(
            'A senha atual está incorreta ou sua sessão expirou.',
        );
        // The 401 makes the page ask the API again whether the session is still there.
        await waitFor(() =>
            expect(fetchMock.mock.calls.filter(([url]) => url === '/api/auth/me')).toHaveLength(2),
        );
        expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy();
        expect(screen.queryByRole('dialog', { name: 'Acesso do administrador' })).toBeNull();
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
