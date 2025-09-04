import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Login from './Login.jsx'
import Home from './Home.jsx'
import Admin from './Admin.jsx'
import ChangePassword from './ChangePassword.jsx'
import { useAuthStore } from '../stores/auth.js'

function RequireAuth() {
  const me = useAuthStore(s => s.me)
  const loading = useAuthStore(s => s.loading)
  const location = useLocation()
  if (loading) return null
  if (!me) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}


