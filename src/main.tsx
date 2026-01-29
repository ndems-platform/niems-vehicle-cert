import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PreviewPage } from './pages/PreviewPage'
import './styles/index.css'

// Simple routing based on pathname
const isPreviewPage = window.location.pathname.includes('/preview');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {isPreviewPage ? <PreviewPage /> : <App />}
    </StrictMode>,
)
