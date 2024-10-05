import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from 'src/App.jsx'
import 'src/index.less'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
