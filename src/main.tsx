import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProvider } from './context/AppProvider'
import { AuthProvider } from './context/AuthProvider'
import { LanguageProvider } from './context/LanguageProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
