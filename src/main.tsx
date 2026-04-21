import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

/**
 * Topper AI Guru - Main Entry Point
 * 
 * Yeh file application ko DOM mein mount karti hai aur i18n/CSS ko load karti hai.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Check your index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
