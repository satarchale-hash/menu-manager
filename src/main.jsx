import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import CustomerMenu from './CustomerMenu.jsx'

// Gestisce redirect da 404.html per GitHub Pages
const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('_r')
if (redirectPath) {
  window.history.replaceState(null, '', redirectPath + window.location.hash)
}

const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <App /> : <CustomerMenu />}
  </StrictMode>,
)
