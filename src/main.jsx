import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import faviconPng from './assets/logo_favicon.png'
import './index.css'

let faviconLink = document.querySelector("link[rel='icon']")
if (!faviconLink) {
  faviconLink = document.createElement('link')
  faviconLink.rel = 'icon'
  document.head.appendChild(faviconLink)
}
faviconLink.type = 'image/png'
faviconLink.href = faviconPng

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/lk">
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)