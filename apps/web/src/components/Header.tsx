import type { ReactNode } from 'react';
import './styles/Header.css';

export interface HeaderProps {
    /** Line under the title (e.g. "Painel Administrador"). */
    subtitle?: string;
    /** Before the title, on the left (the admin menu button). */
    start?: ReactNode;
    /** Actions on the right (the cart, admin buttons). */
    children?: ReactNode;
}

export function Header({ subtitle, start, children }: HeaderProps) {
    return (
        // `#top` is the target of the footer's "Voltar ao início" link.
        <header className="app__header" id="top">
            <div className="app__header-start">
                {start}
                <div className="app__brand">
                    <h1>Café da Física</h1>
                    {subtitle && <p className="app__subtitle">{subtitle}</p>}
                </div>
            </div>
            {children}
        </header>
    );
}
