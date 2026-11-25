import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Login from './Login.jsx'
import './style.css'

const KEY = 'itkpdn.sesi'
const baca = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) } catch { return null } }

function Root() {
  const [user, setUser] = useState(baca)
  const masuk = (u) => { try { sessionStorage.setItem(KEY, JSON.stringify(u)) } catch {} setUser(u) }
  const keluar = () => { try { sessionStorage.removeItem(KEY) } catch {} setUser(null) }
  return user ? <App user={user} onLogout={keluar} /> : <Login onLogin={masuk} />
}

createRoot(document.getElementById('root')).render(<Root />)
