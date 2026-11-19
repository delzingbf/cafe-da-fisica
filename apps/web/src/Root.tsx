import { lazy, Suspense } from 'react';
import App from './App';

// Loaded only on /admin, so the public menu does not download the admin panel.
const AdminApp = lazy(() => import('./AdminApp'));

/** Picks the screen from the URL: the public menu, or the admin panel under /admin. */
export function Root() {
    if (!/^\/admin(\/|$)/.test(window.location.pathname)) return <App />;

    return (
        <Suspense fallback={null}>
            <AdminApp />
        </Suspense>
    );
}
