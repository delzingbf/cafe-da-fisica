import './styles/Footer.css';

export function Footer() {
    return (
        <footer className="app__footer">
            <div className="app__footer-info">
                <div className="app__footer-brand">
                    <strong>Café da Física</strong>
                    <p>O melhor café do Campus do Vale</p>

                    <p>Café, doces e salgados</p>
                    <strong className="app__footer-hours">Horário de Funcionamento</strong>
                    <p>Segunda-feira à quinta-feira: 8h--16h30 e 18h30--20h</p>
                    <p>Sexta-feira: 8h--16h30</p>
                </div>
                <address className="app__footer-location">
                    <strong>Localização</strong>
                    <span>Prédio 43164</span>
                    <span>Instituto de Física - DAEF - 43164</span>
                    <span>Av. Bento Gonçalves, 9500 / Prédio 43164</span>
                    <span>Bairro Agronomia</span>
                    <span>91509-900 Porto Alegre RS</span>
                </address>
            </div>
            <nav className="app__footer-contact" aria-label="Contatos">
                <a
                    href="https://www.instagram.com/cafe_da_fisica/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    @cafe_da_fisica
                </a>
                <a href="mailto:cafedafisica2026@gmail.com">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                    </svg>
                    cafedafisica2026@gmail.com
                </a>
                <a
                    href="https://www.google.com/maps/search/?api=1&query=Av.+Bento+Gon%C3%A7alves%2C+9500%2C+Pr%C3%A9dio+43164%2C+Porto+Alegre%2C+RS"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    Como chegar
                </a>
            </nav>
            <div className="app__footer-meta">
                <a href="#top">Voltar ao início</a>
                <small>© {new Date().getFullYear()} Café da Física</small>
            </div>
        </footer>
    );
}
