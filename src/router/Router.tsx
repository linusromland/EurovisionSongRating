import type {  ComponentChildren } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { HomePage } from '../pages/HomePage'; 
import { ScoreboardPage } from '../pages/ScoreboardPage';

const routes: Record<string, () => ComponentChildren> = {
    '/': () => <HomePage />,
    '/scoreboard': () => <ScoreboardPage />,
};

export function Router() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

    useEffect(() => {
        const onLocationChange = () => {
            setCurrentPath(window.location.pathname || '/');
        };

        window.addEventListener('popstate', onLocationChange);

        return () => {
            window.removeEventListener('popstate', onLocationChange);
        };
    }, []);

    const PageComponent = routes[currentPath]; 

    if (!PageComponent) {
        return (
            <div class="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <header class="app-header"><h1>404 - Page Not Found</h1></header>
                <p>Sorry, the page you are looking for does not exist.</p>
                <a href="/" style={{color: 'var(--accent-color-2)'}}>Go to Homepage</a>
            </div>
        );
    }

    return <PageComponent />;
}
