import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


// Theme Management is now handled within the React App component to stay in sync with user settings.

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
