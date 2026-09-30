import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from './config'
import Landing from './pages/Landing'
import Login from './pages/Login'
import DashboardGerente from './pages/DashboardGerente'
import Recepcion from './pages/Recepcion'
import Entrenador from './pages/Entrenador'
import Socio from './pages/Socio'

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  const userRol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(userRol)) {
    // Si no tiene el rol, que vaya al landing
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/gerente" element={
            <ProtectedRoute roles={['GERENTE', 'ADMIN']}>
              <DashboardGerente />
            </ProtectedRoute>
          } />
          
          <Route path="/recepcion" element={
            <ProtectedRoute roles={['RECEPCIONISTA', 'ADMIN', 'GERENTE']}>
              <Recepcion />
            </ProtectedRoute>
          } />
          
          <Route path="/entrenador" element={
            <ProtectedRoute roles={['ENTRENADOR', 'ADMIN', 'GERENTE']}>
              <Entrenador />
            </ProtectedRoute>
          } />
          
          <Route path="/socio" element={
            <ProtectedRoute roles={['SOCIO', 'ADMIN', 'GERENTE']}>
              <Socio />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
