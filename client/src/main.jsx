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

// Hide initial loader once React is ready and cinematic animation finishes
// The CSS animation for the progress bar is 3.5s, so we wait at least that long
setTimeout(() => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('fade-out');
    // Allow time for the 1.2s opacity transition to complete
    setTimeout(() => loader.remove(), 1200);
  }
}, 3800);
