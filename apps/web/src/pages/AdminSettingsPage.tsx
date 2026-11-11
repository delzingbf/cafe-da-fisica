import { useEffect, useState, type FormEvent } from 'react';
import type {
    ChangeAdminPasswordRequest,
    SettingsResponse,
    UpdateOrderNotificationEmailRequest,
    UpdateOrderNotificationEmailResponse,
} from '@cafe-da-fisica/shared';
import { ApiError, api } from '../api/client';
import './styles/AdminSettingsPage.css';

function emailErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.status === 400) {
        return 'Informe um endereço de e-mail válido.';
    }
    return 'Não foi possível salvar o e-mail. Verifique sua conexão e tente novamente.';
}

function passwordErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.status === 401) {
        return 'A senha atual está incorreta ou sua sessão expirou.';
    }
    if (error instanceof ApiError && error.status === 400) {
        return 'A nova senha precisa ter entre 8 e 128 caracteres.';
    }
    return 'Não foi possível trocar a senha. Verifique sua conexão e tente novamente.';
}

export function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsResponse | null>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [emailSaving, setEmailSaving] = useState(false);
    const [emailMessage, setEmailMessage] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        api.get<SettingsResponse>('/settings', { signal: controller.signal })
            .then((loadedSettings) => {
                setSettings(loadedSettings);
                setEmail(loadedSettings.orderNotificationEmail ?? '');
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setEmailError('Não foi possível carregar as configurações. Tente novamente.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, []);

    const saveEmail = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setEmailSaving(true);
        setEmailMessage(null);
        setEmailError(null);

        const normalizedEmail = email.trim().toLowerCase();
        const request: UpdateOrderNotificationEmailRequest = { email: normalizedEmail };
        try {
            const result = await api.put<UpdateOrderNotificationEmailResponse>(
                '/settings/order-notification-email',
                request,
            );
            setEmail(normalizedEmail);
            setSettings({ orderNotificationEmail: normalizedEmail });
            setEmailMessage(
                result.confirmationEmailSent
                    ? 'E-mail atualizado. Enviamos uma confirmação ao endereço informado.'
                    : 'E-mail atualizado, mas não foi possível enviar a confirmação. Verifique a configuração de e-mail do sistema.',
            );
        } catch (error) {
            setEmailError(emailErrorMessage(error));
        } finally {
            setEmailSaving(false);
        }
    };

    const changePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordMessage(null);
        setPasswordError(null);

        if (newPassword !== confirmPassword) {
            setPasswordError('A confirmação não corresponde à nova senha.');
            return;
        }

        setPasswordSaving(true);
        const request: ChangeAdminPasswordRequest = { currentPassword, newPassword };
        try {
            await api.post<void>('/auth/password', request);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordMessage('Senha alterada com sucesso.');
        } catch (error) {
            setPasswordError(passwordErrorMessage(error));
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <section className="admin-settings" aria-labelledby="admin-settings-title">
            <header className="admin-settings__header">
                <h2 id="admin-settings-title">Configurações</h2>
                <p>Gerencie o recebimento de pedidos e o acesso ao painel.</p>
            </header>

            <section className="admin-settings__card" aria-labelledby="notification-email-title">
                <div className="admin-settings__card-heading">
                    <h3 id="notification-email-title">E-mail de recebimento de pedidos</h3>
                    <p>Os avisos de novos pedidos serão enviados para este endereço.</p>
                </div>
                {loading ? (
                    <p className="admin-settings__hint" role="status">
                        Carregando configurações…
                    </p>
                ) : (
                    <form
                        className="admin-settings__form"
                        onSubmit={(event) => void saveEmail(event)}
                    >
                        <label className="admin-settings__field">
                            E-mail
                            <input
                                type="email"
                                autoComplete="email"
                                maxLength={254}
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </label>
                        {settings?.orderNotificationEmail === null && (
                            <p className="admin-settings__hint">
                                Ainda não há um e-mail configurado.
                            </p>
                        )}
                        {emailError && (
                            <p className="admin-settings__error" role="alert">
                                {emailError}
                            </p>
                        )}
                        {emailMessage && (
                            <p className="admin-settings__success" role="status">
                                {emailMessage}
                            </p>
                        )}
                        <button
                            className="admin-settings__button"
                            disabled={emailSaving}
                            type="submit"
                        >
                            {emailSaving ? 'Salvando…' : 'Salvar e-mail'}
                        </button>
                    </form>
                )}
            </section>

            <section className="admin-settings__card" aria-labelledby="change-password-title">
                <div className="admin-settings__card-heading">
                    <h3 id="change-password-title">Trocar senha</h3>
                    <p>
                        Use sua senha atual para cadastrar uma nova senha com pelo menos 8
                        caracteres.
                    </p>
                </div>
                <form
                    className="admin-settings__form"
                    onSubmit={(event) => void changePassword(event)}
                >
                    <label className="admin-settings__field">
                        Senha atual
                        <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                        />
                    </label>
                    <label className="admin-settings__field">
                        Nova senha
                        <input
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            required
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                    </label>
                    <label className="admin-settings__field">
                        Confirmar nova senha
                        <input
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            required
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                    </label>
                    {passwordError && (
                        <p className="admin-settings__error" role="alert">
                            {passwordError}
                        </p>
                    )}
                    {passwordMessage && (
                        <p className="admin-settings__success" role="status">
                            {passwordMessage}
                        </p>
                    )}
                    <button
                        className="admin-settings__button"
                        disabled={passwordSaving}
                        type="submit"
                    >
                        {passwordSaving ? 'Alterando…' : 'Trocar senha'}
                    </button>
                </form>
            </section>

            <section className="admin-settings__card" aria-labelledby="appearance-title">
                <div className="admin-settings__card-heading">
                    <h3 id="appearance-title">Mudanças de estética</h3>
                    <p>Prévia das opções que poderão personalizar a aparência do site.</p>
                </div>
                <div
                    className="admin-settings__appearance"
                    aria-label="Prévia visual, sem funcionalidade"
                >
                    <div className="admin-settings__palette" aria-label="Paleta da gestão atual">
                        {[
                            { name: 'Creme', color: '#E2D9BC' },
                            { name: 'Azul', color: '#80ABD7' },
                            { name: 'Vermelho', color: '#B20E19' },
                            { name: 'Marrom', color: '#683629' },
                        ].map(({ name, color }) => (
                            <div className="admin-settings__swatch" key={name}>
                                <span
                                    className="admin-settings__swatch-color"
                                    style={{ backgroundColor: color }}
                                    aria-hidden="true"
                                />
                                <span>
                                    {name}
                                    <small>{color}</small>
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="admin-settings__logo-preview">
                        <img
                            src="/logo-cafe-da-fisica.png"
                            alt="Logo da gestão atual do Café da Física"
                        />
                    </div>
                </div>
                <p className="admin-settings__hint">
                    Esta área é apenas visual e ainda não é funcional.
                </p>
            </section>
        </section>
    );
}
