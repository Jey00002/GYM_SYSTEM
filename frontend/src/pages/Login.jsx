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
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      procesarToken(res.data.token);
    } catch (err) {
      setError('Error al iniciar sesión con Google.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
      
      <Link to="/" className="absolute top-8 left-8 text-white font-bold italic-heavy text-2xl tracking-tighter hover:scale-105 transition">
        GYM<span className="text-orange-500">STAR</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-[#141414] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
          <User className="w-8 h-8 text-orange-500" />
        </div>
        
        <h2 className="text-3xl italic-heavy text-white mb-2 tracking-tight">BIENVENIDO</h2>
        <p className="text-gray-400 text-sm mb-8">Ingresa tus credenciales para acceder a tu panel.</p>

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
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
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
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide transition-all disabled:opacity-50"
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
