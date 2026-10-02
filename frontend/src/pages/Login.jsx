import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, User } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (token) {
      if (rol === 'GERENTE' || rol === 'ADMIN') navigate('/gerente');
      else if (rol === 'RECEPCIONISTA') navigate('/recepcion');
      else if (rol === 'ENTRENADOR') navigate('/entrenador');
      else navigate('/socio');
    }
  }, [navigate]);

  const procesarToken = (token) => {
    localStorage.setItem('token', token);
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const rol = decoded.rol || 'SOCIO';
    localStorage.setItem('rol', rol);

    const pendiente = localStorage.getItem('planSeleccionado');
    if (pendiente) {
      navigate('/');
    } else {
      if (rol === 'GERENTE' || rol === 'ADMIN') navigate('/gerente');
      else if (rol === 'RECEPCIONISTA') navigate('/recepcion');
      else if (rol === 'ENTRENADOR') navigate('/entrenador');
      else navigate('/socio');
    }
  };

  const loginManual = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { correo, contrasena });
      procesarToken(res.data.token);
    } catch (err) {
      setError('Credenciales incorrectas o error de servidor.');
    } finally {
      setCargando(false);
    }
  };

  const loginGoogle = async (credentialResponse) => {
    setError('');
    setCargando(true);
    try {
      const payloadBase64 = credentialResponse.credential.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      
      const requestData = {
        correo: decodedPayload.email,
        nombre: decodedPayload.name || decodedPayload.given_name || decodedPayload.email.split('@')[0]
      };
      
      const res = await api.post('/auth/login-google', requestData);
      procesarToken(res.data.token);
    } catch (err) {
      setError('Error al iniciar sesión con Google.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo Cinemático: Imagen monocromática con viñeta profunda */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
      
      <Link to="/" className="absolute top-8 left-8 text-white font-black text-2xl tracking-widest hover:text-blue-600 transition-colors z-20 uppercase">
        GYM<span className="text-blue-600">STAR</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div className="mb-10">
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Acceso<br/><span className="text-blue-600">Autorizado</span></h2>
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={loginManual} className="space-y-5 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                placeholder="ejemplo@gym.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required 
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end mt-3">
              <Link to="/recuperar-contrasena" className="text-xs text-gray-400 hover:text-blue-600 transition-colors tracking-wide">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide transition-all disabled:opacity-50"
          >
            {cargando ? 'Procesando...' : 'Iniciar Sesión'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase tracking-wider">o ingresa con</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div className="flex justify-center mt-2 bg-white/5 border border-white/10 rounded-2xl p-4">
          <GoogleLogin
            onSuccess={loginGoogle}
            onError={() => setError('No se pudo abrir Google')}
            theme="filled_black"
            size="large"
            shape="rectangular"
            locale="es"
          />
        </div>
      </motion.div>
    </div>
  );
}
