import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Préfixer tous les appels /api/ avec l'URL Railway en production
const _fetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl && typeof input === 'string' && input.startsWith('/api/')) {
    input = `${apiUrl}${input}`;
  }
  return _fetch(input, init);
};

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}