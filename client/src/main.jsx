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


// Global function to hide initial loader, allowing synchronization with React state/auth
window.hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader && !loader.classList.contains('fade-out')) {
    // The CSS animation for the progress bar is 3.5s
    // If this is called before 3.5s, we might want to wait,
    // but typically we want it to stay until auth is ready.
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 1200);
  }
};
