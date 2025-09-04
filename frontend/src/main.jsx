import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './routes/App.jsx'
import './styles/vars.css'
import './styles/app.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/dadpoker">
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


