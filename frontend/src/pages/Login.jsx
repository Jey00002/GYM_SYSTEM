import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, ArrowRight, User, CheckCircle2, AlertCircle, 
  ShieldCheck, ArrowLeft, RefreshCw, Eye, EyeOff, Sparkles 
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modo: 'login' o 'registro'
  const [modo, setModo] = useState(() => searchParams.get('modo') === 'registro' ? 'registro' : 'login');

  // Estados de Login
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPassLogin, setMostrarPassLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [sugerirRegistro, setSugerirRegistro] = useState(false);

  // Estados de Registro
  const [pasoRegistro, setPasoRegistro] = useState(1); // 1: Datos, 2: Validación de código
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regContrasena, setRegContrasena] = useState('');
  const [regConfirmarContrasena, setRegConfirmarContrasena] = useState('');
  const [mostrarPassReg, setMostrarPassReg] = useState(false);
  const [regCodigo, setRegCodigo] = useState('');
  const [codigoDemoGenerado, setCodigoDemoGenerado] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [segundosReenvio, setSegundosReenvio] = useState(0);

  // Estado general
  const [cargando, setCargando] = useState(false);

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

  useEffect(() => {
    if (segundosReenvio > 0) {
      const timer = setTimeout(() => setSegundosReenvio(segundosReenvio - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [segundosReenvio]);

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

  // Validadores de Gmail
  const esGmailValido = (email) => {
    if (!email) return false;
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return regex.test(email.trim());
  };

  const tieneDominioInvalido = (email) => {
    if (!email || !email.includes('@')) return false;
    return !email.trim().toLowerCase().endsWith('@gmail.com');
  };

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setErrorLogin('');
    setErrorRegistro('');
    setSugerirRegistro(false);
    setMensajeExito('');
    if (nuevoModo === 'registro' && correo && correo.toLowerCase().endsWith('@gmail.com')) {
      setRegCorreo(correo);
    }
  };

  // Login manual
  const loginManual = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorLogin('');
    setSugerirRegistro(false);
    try {
      const res = await api.post('/auth/login', { 
        correo: correo.trim().toLowerCase(), 
        contrasena 
      });
      procesarToken(res.data.token);
    } catch (err) {
      const msg = err.response?.data?.error || 'Credenciales incorrectas o error de servidor.';
      setErrorLogin(msg);
      if (msg.toLowerCase().includes('no existe') || msg.toLowerCase().includes('crear una')) {
        setSugerirRegistro(true);
      }
    } finally {
      setCargando(false);
    }
  };

  // Login y Registro con Google (valida el correo y token con Google OAuth)
  const loginGoogle = async (credentialResponse) => {
    setErrorLogin('');
    setErrorRegistro('');
    setCargando(true);
    try {
      const payloadBase64 = credentialResponse.credential.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      
      const email = decodedPayload.email;
      if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
        const errorMsg = 'Solo se permiten cuentas con el dominio @gmail.com.';
        if (modo === 'registro') setErrorRegistro(errorMsg);
        else setErrorLogin(errorMsg);
        setCargando(false);
        return;
      }

      const requestData = {
        correo: email.trim().toLowerCase(),
        nombre: decodedPayload.name || decodedPayload.given_name || email.split('@')[0]
      };
      
      const res = await api.post('/auth/login-google', requestData);
      procesarToken(res.data.token);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al autenticar con Google.';
      if (modo === 'registro') setErrorRegistro(msg);
      else setErrorLogin(msg);
    } finally {
      setCargando(false);
    }
  };

  // Paso 1 de Registro: Validar datos y solicitar código de verificación
  const solicitarCodigoValidacion = async (e) => {
    e.preventDefault();
    setErrorRegistro('');
    setMensajeExito('');

    if (!regNombre.trim()) {
      setErrorRegistro('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!esGmailValido(regCorreo)) {
      setErrorRegistro('El correo debe tener un formato válido y pertenecer al dominio @gmail.com.');
      return;
    }

    if (regContrasena.length < 6) {
      setErrorRegistro('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regContrasena !== regConfirmarContrasena) {
      setErrorRegistro('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const res = await api.post('/auth/enviar-codigo', { 
        correo: regCorreo.trim().toLowerCase() 
      });
      setCodigoDemoGenerado(res.data.codigoDemo || '');
      setPasoRegistro(2);
      setSegundosReenvio(60);
      setMensajeExito('Código de validación generado para ' + regCorreo.trim().toLowerCase());
    } catch (err) {
      setErrorRegistro(err.response?.data?.error || 'Error al generar código de validación.');
    } finally {
      setCargando(false);
    }
  };

  // Reenviar código
  const reenviarCodigo = async () => {
    if (segundosReenvio > 0) return;
    setCargando(true);
    setErrorRegistro('');
    setMensajeExito('');
    try {
      const res = await api.post('/auth/enviar-codigo', { 
        correo: regCorreo.trim().toLowerCase() 
      });
      setCodigoDemoGenerado(res.data.codigoDemo || '');
      setSegundosReenvio(60);
      setMensajeExito('Se envió un nuevo código de validación a tu correo.');
    } catch (err) {
      setErrorRegistro(err.response?.data?.error || 'Error al reenviar código.');
    } finally {
      setCargando(false);
    }
  };

  // Paso 2 de Registro: Confirmar código y crear la cuenta
  const confirmarRegistro = async (e) => {
    e.preventDefault();
    setErrorRegistro('');
    setMensajeExito('');

    if (!regCodigo.trim()) {
      setErrorRegistro('Ingresa el código de 6 dígitos que enviamos a tu correo.');
      return;
    }

    setCargando(true);
    try {
      const res = await api.post('/auth/registro', {
        nombre: regNombre.trim(),
        correo: regCorreo.trim().toLowerCase(),
        contrasena: regContrasena,
        codigoVerificacion: regCodigo.trim()
      });
      procesarToken(res.data.token);
    } catch (err) {
      setErrorRegistro(err.response?.data?.error || 'Código incorrecto o no se pudo completar el registro.');
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
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} 
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-black/50 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.7)] relative z-10"
      >
        {/* Pestañas de Alternancia: Iniciar Sesión / Crear Cuenta */}
        <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 mb-8">
          <button
            type="button"
            onClick={() => cambiarModo('login')}
            className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              modo === 'login'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => cambiarModo('registro')}
            className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              modo === 'registro'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Crear Cuenta
          </button>
        </div>

        <AnimatePresence mode="wait">
          {modo === 'login' ? (
            /* ==================== VISTA: INICIAR SESIÓN ==================== */
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter uppercase">
                  Acceso<br/><span className="text-blue-600">Autorizado</span>
                </h2>
                <p className="text-gray-400 text-xs tracking-[0.2em] uppercase">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              {errorLogin && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorLogin}</span>
                  </div>
                  {sugerirRegistro && (
                    <button
                      type="button"
                      onClick={() => {
                        if (correo) setRegCorreo(correo);
                        cambiarModo('registro');
                      }}
                      className="mt-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Crear cuenta con este correo
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={loginManual} className="space-y-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Correo Electrónico
                  </label>
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
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type={mostrarPassLogin ? "text" : "password"}
                      required 
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-11 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassLogin(!mostrarPassLogin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                    >
                      {mostrarPassLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={cargando}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50"
                >
                  {cargando ? 'Procesando...' : 'Iniciar Sesión'} <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Botón directo para usuarios que no tienen cuenta */}
              <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-center mb-5">
                <p className="text-xs text-gray-400 mb-1.5">¿No tienes ninguna cuenta creada?</p>
                <button
                  type="button"
                  onClick={() => cambiarModo('registro')}
                  className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition-transform" />
                  <span>Crear una cuenta con Gmail (@gmail.com)</span>
                </button>
              </div>

              <div className="relative flex items-center py-2 mb-4">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  o ingresa con Google
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="flex justify-center bg-white/5 border border-white/10 rounded-2xl p-3 mb-6">
                <GoogleLogin
                  onSuccess={loginGoogle}
                  onError={() => setErrorLogin('No se pudo abrir Google')}
                  theme="filled_black"
                  size="large"
                  shape="rectangular"
                  locale="es"
                />
              </div>

              {/* Cuentas de Acceso Rápido */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center mb-2.5">
                  Acceso Rápido Demo (1 clic)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCorreo('entrenador@gym.com'); setContrasena('123456'); }}
                    className="bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 p-2 rounded-xl text-left transition group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-blue-400">🏋️ Entrenador</p>
                    <p className="text-[10px] text-gray-500 truncate">entrenador@gym.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCorreo('recepcion@gym.com'); setContrasena('123456'); }}
                    className="bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 p-2 rounded-xl text-left transition group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-blue-400">📋 Recepción</p>
                    <p className="text-[10px] text-gray-500 truncate">recepcion@gym.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCorreo('gerente@gym.com'); setContrasena('123456'); }}
                    className="bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 p-2 rounded-xl text-left transition group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-blue-400">👑 Gerente</p>
                    <p className="text-[10px] text-gray-500 truncate">gerente@gym.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCorreo('socio@gym.com'); setContrasena('123456'); }}
                    className="bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 p-2 rounded-xl text-left transition group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-blue-400">🏃 Socio</p>
                    <p className="text-[10px] text-gray-500 truncate">socio@gym.com</p>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ==================== VISTA: CREAR CUENTA CON GMAIL ==================== */
            <motion.div
              key="registro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Dominio Exclusivo @gmail.com
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter uppercase">
                  Crear<br/><span className="text-blue-600">Nueva Cuenta</span>
                </h2>
                <p className="text-gray-400 text-xs tracking-wide">
                  {pasoRegistro === 1 
                    ? 'Regístrate con tu correo de Gmail para validar tu identidad'
                    : 'Ingresa el código de 6 dígitos para validar tu correo'}
                </p>
              </div>

              {errorRegistro && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorRegistro}</span>
                </div>
              )}

              {mensajeExito && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-xl text-sm mb-5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{mensajeExito}</span>
                </div>
              )}

              {pasoRegistro === 1 ? (
                /* PASO 1: FORMULARIO DE DATOS */
                <div>
                  <form onSubmit={solicitarCodigoValidacion} className="space-y-4 mb-5">
                    {/* Nombre Completo */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Nombres y Apellidos
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          required 
                          value={regNombre}
                          onChange={(e) => setRegNombre(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                          placeholder="Ej. Roberto Morales"
                        />
                      </div>
                    </div>

                    {/* Correo Electrónico (con validación de dominio @gmail.com) */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Correo Electrónico (Gmail)
                        </label>
                        {regCorreo && (
                          esGmailValido(regCorreo) ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Dominio válido
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Debe ser @gmail.com
                            </span>
                          )
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="email" 
                          required 
                          value={regCorreo}
                          onChange={(e) => setRegCorreo(e.target.value)}
                          className={`w-full bg-[#0a0a0a] border rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${
                            regCorreo 
                              ? (esGmailValido(regCorreo) ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-amber-500/50 focus:border-amber-500')
                              : 'border-white/10 focus:border-blue-600'
                          }`}
                          placeholder="tu.correo@gmail.com"
                        />
                      </div>
                      {tieneDominioInvalido(regCorreo) && (
                        <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Solo se aceptan correos con el dominio <strong className="text-white">@gmail.com</strong>
                        </p>
                      )}
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Contraseña (mínimo 6 caracteres)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type={mostrarPassReg ? "text" : "password"}
                          required 
                          value={regContrasena}
                          onChange={(e) => setRegContrasena(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassReg(!mostrarPassReg)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                        >
                          {mostrarPassReg ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Confirmar Contraseña
                        </label>
                        {regConfirmarContrasena && (
                          regContrasena === regConfirmarContrasena ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Coinciden
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> No coinciden
                            </span>
                          )
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type={mostrarPassReg ? "text" : "password"}
                          required 
                          value={regConfirmarContrasena}
                          onChange={(e) => setRegConfirmarContrasena(e.target.value)}
                          className={`w-full bg-[#0a0a0a] border rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${
                            regConfirmarContrasena
                              ? (regContrasena === regConfirmarContrasena ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-red-500/50 focus:border-red-500')
                              : 'border-white/10 focus:border-blue-600'
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {/* Botón para avanzar a validación de correo */}
                    <button 
                      type="submit" 
                      disabled={cargando || !esGmailValido(regCorreo) || regContrasena.length < 6 || regContrasena !== regConfirmarContrasena}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {cargando ? 'Generando código...' : 'Validar Correo Gmail'} <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>

                  <div className="relative flex items-center py-2 mb-4">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                      o registrarse directamente con
                    </span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  {/* Registro directo con Google (valida el correo y token con Google OAuth) */}
                  <div className="flex justify-center bg-white/5 border border-white/10 rounded-2xl p-3 mb-5">
                    <GoogleLogin
                      onSuccess={loginGoogle}
                      onError={() => setErrorRegistro('No se pudo abrir Google')}
                      theme="filled_black"
                      size="large"
                      shape="rectangular"
                      text="signup_with"
                      locale="es"
                    />
                  </div>

                  <p className="text-center text-xs text-gray-500 tracking-wider">
                    ¿Ya tienes una cuenta?{' '}
                    <button 
                      type="button" 
                      onClick={() => cambiarModo('login')} 
                      className="text-white hover:text-blue-500 font-bold underline transition"
                    >
                      Inicia Sesión aquí
                    </button>
                  </p>
                </div>
              ) : (
                /* PASO 2: INGRESO DEL CÓDIGO DE VALIDACIÓN */
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setPasoRegistro(1);
                      setErrorRegistro('');
                      setMensajeExito('');
                    }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-5 transition font-bold uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" /> Modificar correo o datos
                  </button>

                  {/* Banner de código para demostración inmediata */}
                  {codigoDemoGenerado && (
                    <div className="bg-gradient-to-r from-blue-950/80 to-blue-900/40 border border-blue-500/40 p-4 rounded-xl mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">
                          Código de Validación Generado
                        </p>
                        <p className="text-2xl font-black text-white tracking-[0.3em] font-mono">
                          {codigoDemoGenerado}
                        </p>
                        <p className="text-[10px] text-gray-400">Valida que eres el titular de {regCorreo}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRegCodigo(codigoDemoGenerado)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-3 py-2 rounded-lg transition uppercase tracking-wider"
                      >
                        Auto-llenar
                      </button>
                    </div>
                  )}

                  <form onSubmit={confirmarRegistro} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 text-center">
                        Ingresa el código de 6 dígitos
                      </label>
                      <input 
                        type="text" 
                        maxLength={6}
                        required 
                        autoFocus
                        value={regCodigo}
                        onChange={(e) => setRegCodigo(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#0a0a0a] border-2 border-blue-500/50 focus:border-blue-500 rounded-xl py-4 text-center text-3xl font-black tracking-[0.4em] font-mono text-white focus:outline-none transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                        placeholder="••••••"
                      />
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Código enviado a: <strong className="text-white">{regCorreo}</strong>
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={cargando || regCodigo.length < 6}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cargando ? 'Verificando y Creando...' : 'Confirmar y Crear Cuenta'} <ShieldCheck className="w-5 h-5" />
                    </button>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={segundosReenvio > 0 || cargando}
                        onClick={reenviarCodigo}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 disabled:opacity-50 transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
                        {segundosReenvio > 0 
                          ? `Reenviar código (${segundosReenvio}s)` 
                          : 'Reenviar código'}
                      </button>

                      <button
                        type="button"
                        onClick={() => cambiarModo('login')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold transition"
                      >
                        Ya tengo cuenta
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
