import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { SessionProvider } from './context/SessionContext'; // New import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <SessionProvider> {/* Wrap App with SessionProvider */}
        <App />
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>,
)