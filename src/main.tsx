import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App}  from './App'
import { AuthContextProvider } from './contexts/AuthContextProvide'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
    <App />
    </AuthContextProvider>
  </StrictMode>,
)
