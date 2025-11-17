import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Service worker registration intentionally removed. If you want to re-enable
// the PWA service worker, re-add registration here or use `vite-plugin-pwa`.
