import { useId, useState, type FormEvent } from 'react';
import type { LoginRequest } from '@cafe-da-fisica/shared';
import { ApiError } from '../api/client';
import { Dialog } from './Dialog';
import './styles/LoginDialog.css';

export interface LoginDialogProps {
    /** Resolves once logged in (the parent then unmounts the dialog); rejects to show an error. */
    onLogin: (credentials: LoginRequest) => Promise<void>;
}

function loginErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.status === 401) {
        return 'E-mail ou senha incorretos.';
    }
    if (error instanceof ApiError && error.status === 429) {
        return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
    }
    return 'Não foi possível entrar. Verifique sua conexão e tente de novo.';
}

/** Login card over a heavily blurred page. It cannot be dismissed: the only ways out are logging in or going back to the menu. */
export function LoginDialog({ onLogin }: LoginDialogProps) {
    const titleId = useId();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await onLogin({ email, password });
        } catch (loginError) {
            setError(loginErrorMessage(loginError));
            setPassword('');
            setSubmitting(false);
        }
    };

    return (
        <Dialog labelledBy={titleId} dismissible={false} backdrop="strong" className="login-card">
            <form className="login-card__form" onSubmit={(event) => void handleSubmit(event)}>
                <div className="login-card__header">
                    <p className="login-card__brand">Café da Física</p>
                    <h2 id={titleId}>Acesso do administrador</h2>
                    <p className="login-card__hint">Entre com seu e-mail e senha.</p>
                </div>

                <label className="login-card__field">
                    E-mail
                    <input
                        type="email"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </label>

                <label className="login-card__field">
                    Senha
                    <input
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>

                {error && (
                    <p className="login-card__error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" className="login-card__submit" disabled={submitting}>
                    {submitting ? 'Entrando…' : 'Entrar'}
                </button>

                <a className="login-card__back" href="/">
                    Voltar ao cardápio
                </a>
            </form>
        </Dialog>
    );
}
