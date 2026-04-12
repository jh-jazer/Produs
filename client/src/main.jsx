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


// Global function to hide initial loader is now handled within index.html 
// to ensure the cinematic animation completes before fading out.
