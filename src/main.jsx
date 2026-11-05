import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import './styles/globals.css'
import './styles/pages.css'
import './styles/components.css'
import './styles/streamix.css'

let preloadRecoveryUsed = false;
window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    if (preloadRecoveryUsed) return;
    preloadRecoveryUsed = true;
    try {
        if (sessionStorage.getItem('streamix:preload-recovery') === 'used') return;
        sessionStorage.setItem('streamix:preload-recovery', 'used');
    } catch {
        // The module-level guard still prevents a loop when storage is unavailable.
    }
    window.location.reload();
});

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);