import type { ReactNode } from 'react';
import './styles/Header.css';

export interface HeaderProps {
    /** Shown beside the menu button (e.g. "Painel Administrador"). */
    subtitle?: string;
    /** On the left (the admin menu button). */
    start?: ReactNode;
    /** Actions on the right (the cart, admin buttons). */
    children?: ReactNode;
}

const logo = (
    <h1 className="app__title">
        <img className="app__logo" src="/logo-cafe-da-fisica.png" alt="Café da Física" />
    </h1>
);

export function Header({ subtitle, start, children }: HeaderProps) {
    // With a subtitle (admin panel), one row: menu and subtitle on the left, the logo centered and
    // the actions on the right (see Header.css). Otherwise the logo on the left, actions on the right.
    if (subtitle) {
        return (
            // `#top` is the target of the footer's "Voltar ao início" link.
            <header className="app__header app__header--with-subtitle" id="top">
                <div className="app__header-start">
                    {start}
                    <p className="app__subtitle">{subtitle}</p>
                </div>
                {logo}
                <div className="app__header-actions">{children}</div>
            </header>
        );
    }

    return (
        <header className="app__header" id="top">
            <div className="app__header-start">
                {start}
                {logo}
            </div>
            {children}
        </header>
    );
}
