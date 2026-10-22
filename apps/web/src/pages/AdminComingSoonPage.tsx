import './styles/AdminComingSoonPage.css';

export interface AdminComingSoonPageProps {
    title: string;
    /** What the page will be for. */
    description: string;
}

/** Placeholder for admin pages that are in the menu but not built yet. */
export function AdminComingSoonPage({ title, description }: AdminComingSoonPageProps) {
    return (
        <section className="admin-coming-soon">
            <h2>{title}</h2>
            <p>{description}</p>
            <p className="admin-coming-soon__badge">Em breve</p>
        </section>
    );
}
