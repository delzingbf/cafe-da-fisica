import { useId, useState, type MouseEvent, type ReactNode } from 'react';
import { ADMIN_SECTION_PATHS, type AdminSection } from '../hooks/useAdminSection';
import { Dialog } from './Dialog';
import './styles/AdminMenu.css';

// Icons are drawn with `currentColor`, so they follow the text color.
function Icon({ children }: { children: ReactNode }) {
    return (
        <svg
            className="admin-menu__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const ITEMS: { section: AdminSection; label: string; icon: ReactNode }[] = [
    {
        section: 'catalog',
        label: 'Catálogo',
        icon: (
            <Icon>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </Icon>
        ),
    },
    {
        section: 'report',
        label: 'Relatório',
        icon: (
            <Icon>
                <path d="M3 3v18h18" />
                <path d="M7 15v2M12 11v6M17 7v10" />
            </Icon>
        ),
    },
    {
        section: 'settings',
        label: 'Configurações',
        icon: (
            <Icon>
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </Icon>
        ),
    },
];

export interface AdminMenuProps {
    current: AdminSection;
    onNavigate: (section: AdminSection) => void;
}

/** "Hamburger" button that opens the admin side menu from the left. */
export function AdminMenu({ current, onNavigate }: AdminMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const titleId = useId();
    const close = () => setIsOpen(false);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>, section: AdminSection) => {
        // Ctrl/Cmd/Shift-click and middle-click keep their usual "open in a new tab/window".
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        onNavigate(section);
        close();
    };

    return (
        <>
            <button
                className="admin-menu__toggle"
                aria-label="Abrir menu"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
            >
                <Icon>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </Icon>
            </button>

            {isOpen && (
                <Dialog
                    placement="start"
                    labelledBy={titleId}
                    className="admin-menu"
                    onClose={close}
                >
                    <div className="admin-menu__header">
                        <h2 id={titleId}>Menu</h2>
                        <button
                            className="admin-menu__close"
                            aria-label="Fechar menu"
                            onClick={close}
                        >
                            ✕
                        </button>
                    </div>

                    <nav aria-label="Painel administrador">
                        <ul className="admin-menu__items">
                            {ITEMS.map(({ section, label, icon }) => (
                                <li key={section}>
                                    <a
                                        className="admin-menu__link"
                                        href={ADMIN_SECTION_PATHS[section]}
                                        aria-current={section === current ? 'page' : undefined}
                                        onClick={(event) => handleClick(event, section)}
                                    >
                                        {icon}
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </Dialog>
            )}
        </>
    );
}
