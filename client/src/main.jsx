import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA
registerSW({ immediate: true })

// Keep dark class in sync with OS preference changes at runtime
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const applyTheme = (e) => {
  document.documentElement.classList.toggle('dark', e.matches);
};
// Use addEventListener for modern browsers, addListener as fallback
if (mq.addEventListener) {
  mq.addEventListener('change', applyTheme);
} else {
  mq.addListener(applyTheme);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
