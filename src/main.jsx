import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Verificación básica del DOM
const rootElement = document.getElementById('root')
console.log('Elemento root encontrado:', rootElement)

if (!rootElement) {
  throw new Error('No se encontró el elemento root en el DOM')
}

// Renderizado simple
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 