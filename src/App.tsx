import { Fragment } from 'preact';
import { Router } from './router/Router';

export function App() {
    return (
        <Fragment>
            <div class="container">
                <header class="app-header">
                    <h1>Eurovision Song Rating</h1>
                    <p>Who will win your heart? Compare the songs from Eurovision Song Contest 2025 and build your ranking!</p>
                </header>
                <Router />
            </div>
        </Fragment>
    );
}
