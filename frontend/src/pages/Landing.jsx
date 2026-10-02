import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Check, Trophy, ArrowRight, User, LogOut, ChevronDown, Smartphone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

import heroImg from '../assets/hero.png';

const FEATURES = {
  'Mensual': ['Acceso ilimitado a máquinas', 'Vestidores y duchas', 'App GYM STAR'],
  'Trimestral': ['Acceso ilimitado a máquinas', 'Evaluación inicial', 'Vestidores y duchas', 'App GYM STAR'],
  'Anual': ['Acceso total', 'Evaluación mensual', 'Congelamiento 30 días', 'Pase invitado mensual', 'App GYM STAR'],
  'Pack Danza 8 clases': ['8 clases de ritmo/danza', 'Válido por 30 días', 'Reserva desde la app'],
  'Pack Danza 12 clases': ['12 clases de ritmo/danza', 'Válido por 30 días', 'Reserva prioritaria'],
  'Mentor 4 sesiones': ['4 sesiones personalizadas', 'Rutina a medida', 'Seguimiento de medidas', 'Válido 30 días'],
  'Mentor 8 sesiones': ['8 sesiones personalizadas', 'Plan nutricional básico', 'Seguimiento continuo', 'Válido 60 días'],
  'Full Access Mensual': ['Todo musculación', 'Clases grupales ilimitadas', '1 Evaluación mensual', 'Toallas incluidas'],
  'Full Access Trimestral': ['Todo musculación', 'Clases ilimitadas', '3 Evaluaciones', 'Toallas y merch exclusivo']
};

export default function Landing() {
  const [planes, setPlanes] = useState([]);
  const [disciplinaActiva, setDisciplinaActiva] = useState('Maquinas');
  const [modalRegistro, setModalRegistro] = useState(false);
  const [planPago, setPlanPago] = useState(null);
  const [paso, setPaso] = useState('');
  const [errorPago, setErrorPago] = useState('');
  const [regError, setRegError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/planes').then(r => {
      setPlanes(r.data);
      const discs = Array.from(new Set(r.data.filter(p => p.disciplina).map(p => p.disciplina.nombre)));
      if (discs.length > 0 && !discs.includes('Maquinas')) setDisciplinaActiva(discs[0]);
    }).catch(e => console.error("Error cargando planes"));

    const pendiente = localStorage.getItem('planSeleccionado');
    if (pendiente && token) {
      setTimeout(() => abrirPago(JSON.parse(pendiente)), 400);
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [token]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setDropdownOpen(false);
    navigate('/');
  };

  const loginGoogleReal = async (credentialResponse) => {
    try {
      setRegError('');
      // Decode the Google JWT
      const payloadBase64 = credentialResponse.credential.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      
      const requestData = {
        correo: decodedPayload.email,
        nombre: decodedPayload.name || decodedPayload.given_name || decodedPayload.email.split('@')[0]
      };
      
      const res = await api.post('/auth/login-google', requestData);
      localStorage.setItem('token', res.data.token);
      
      const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
      const userRol = decoded.rol || 'SOCIO';
      localStorage.setItem('rol', userRol);

      setModalRegistro(false);
      
      const pendiente = localStorage.getItem('planSeleccionado');
      if (pendiente) {
        abrirPago(JSON.parse(pendiente));
      } else {
        if (userRol === 'GERENTE' || userRol === 'ADMIN') navigate('/gerente');
        else if (userRol === 'RECEPCIONISTA') navigate('/recepcion');
        else if (userRol === 'ENTRENADOR') navigate('/entrenador');
        else navigate('/socio');
      }
    } catch (e) {
      setRegError('Error al iniciar sesión con Google.');
    }
  };

  const abrirPago = async (plan) => {
    setPlanPago(plan);
    setPaso('cargando');
    localStorage.removeItem('planSeleccionado');
    
    if (!localStorage.getItem('token')) {
      localStorage.setItem('planSeleccionado', JSON.stringify(plan));
      setPlanPago(null);
      setModalRegistro(true);
      return;
    }

    try {
      const res = await api.get('/panel-socio/datos');
      if (!res.data.socio || !res.data.socio.dni) {
        setPaso('sin-perfil');
      } else {
        setPaso('instrucciones');
      }
    } catch (e) {
      setPaso('sin-perfil');
    }
  };

  const cerrarPago = () => {
    setPlanPago(null);
    setPaso('');
    setErrorPago('');
    localStorage.removeItem('planSeleccionado');
  };

  const confirmarPago = async () => {
    if (!planPago) return;
    setCargando(true);
    setErrorPago('');
    try {
      await api.post('/panel-socio/pago', {
        idPlan: planPago.id,
        metodoPago: 'YAPE',
        transactionId: `YAPE-${Date.now()}`
      });
      setPaso('exito');
    } catch (e) {
      setErrorPago(e.response?.data?.message || 'Error al procesar el pago.');
    } finally {
      setCargando(false);
    }
  };

  const anim = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }
  });

  const getDashboardRoute = () => {
    if (rol === 'GERENTE' || rol === 'ADMIN') return '/gerente';
    if (rol === 'RECEPCIONISTA') return '/recepcion';
    if (rol === 'ENTRENADOR') return '/entrenador';
    return '/socio';
  };

  const disciplinasUnicas = Array.from(new Set(planes.filter(p => p.disciplina).map(p => p.disciplina.nombre)));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-600/30 font-sans">
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl italic-heavy tracking-tighter">
            GYM<span className="text-blue-600">STAR</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wide">
            <a href="#inicio" className="text-gray-400 hover:text-white transition">Inicio</a>
            <a href="#planes" className="text-gray-400 hover:text-white transition">Planes</a>
            
            {token ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  Mi Cuenta
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-[#141414] border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                    >
                      <Link to={getDashboardRoute()} className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                        Ir al Panel
                      </Link>
                      <button onClick={cerrarSesion} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Salir
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="px-5 py-2.5 rounded-full hover:bg-white/5 transition border border-transparent hover:border-white/10">
                  INICIAR SESIÓN
                </Link>
                <button onClick={() => setModalRegistro(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] transition">
                  UNIRSE AHORA
                </button>
              </div>
            )}
          </div>
          
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-40 bg-[#0a0a0a] pt-24 px-6 md:hidden">
            <div className="flex flex-col gap-6 text-xl italic-heavy">
              <a href="#inicio" onClick={() => setMenuOpen(false)}>INICIO</a>
              <a href="#planes" onClick={() => setMenuOpen(false)}>PLANES</a>
              <hr className="border-white/10" />
              {token ? (
                <>
                  <Link to={getDashboardRoute()} className="text-blue-600">MI PANEL</Link>
                  <button onClick={cerrarSesion} className="text-left text-red-500">CERRAR SESIÓN</button>
                </>
              ) : (
                <>
                  <Link to="/login">INICIAR SESIÓN</Link>
                  <button onClick={() => {setMenuOpen(false); setModalRegistro(true);}} className="text-left text-blue-600">UNIRSE AHORA</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header id="inicio" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[100vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Gym Hero" className="w-full h-full object-cover kenburns opacity-40 mix-blend-luminosity filter grayscale" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
              Gimnasio Premium 24/7
            </div>
            <h1 className="text-5xl md:text-7xl italic-heavy leading-[0.9] mb-6 tracking-tighter">
              SIN EXCUSAS<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-500">SOLO RESULTADOS</span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-lg">
              Transforma tu cuerpo y tu mente con equipos de última generación, los mejores entrenadores y acceso mediante tu app móvil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#planes" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl text-center uppercase tracking-wide transition-all hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                Ver Planes
              </a>
              <button onClick={() => !token ? setModalRegistro(true) : navigate(getDashboardRoute())} className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-center transition-all border border-white/10 flex items-center justify-center gap-2">
                {token ? 'Ir a mi Panel' : 'Prueba Gratis 1 Día'}
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <section id="planes" className="py-24 relative bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...anim()} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-bold tracking-[0.2em] text-sm uppercase">ELIGE TU CAMINO</span>
            <h2 className="text-4xl md:text-5xl italic-heavy mt-2 mb-4">MEMBRESÍAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-500">POR DISCIPLINA</span></h2>
            <p className="text-gray-400">Selecciona tu disciplina favorita y descubre los planes que tenemos para ti. Sin cargos ocultos.</p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {disciplinasUnicas.map(dName => {
              const disc = planes.find(p => p.disciplina?.nombre === dName)?.disciplina;
              if(!disc) return null;
              const isActive = disciplinaActiva === disc.nombre;
              return (
                <button
                  key={disc.id}
                  onClick={() => setDisciplinaActiva(disc.nombre)}
                  className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all ${isActive ? 'scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                  style={{ 
                    backgroundColor: isActive ? disc.color : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#000' : '#fff'
                  }}
                >
                  {disc.nombre}
                </button>
              )
            })}
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-center">
            <AnimatePresence mode="popLayout">
              {planes.filter(p => p.disciplina?.nombre === (disciplinaActiva || 'Maquinas')).map((plan, i) => {
                const discColor = plan.disciplina?.color || '#2563eb';
                const destacado = plan.disciplina?.nombre === 'Full Access' || plan.nombrePlan.includes('Trimestral');
                const isFullAccess = plan.disciplina?.nombre === 'Full Access';
                const feats = FEATURES[plan.nombrePlan] || ['Acceso total a instalaciones', 'App GYM STAR'];
                
                return (
                  <motion.div
                    layout
                    key={plan.id}
                    initial={{ opacity: 0, scale: 0.8, y: 30, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.8, y: -30, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                    className={`relative rounded-[2rem] p-[1px] group ${destacado ? 'lg:scale-105 z-10' : 'z-0'}`}
                    style={{ background: destacado ? `linear-gradient(135deg, ${discColor}, transparent 80%)` : 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>
                    <div className="rounded-[calc(2rem-1px)] p-8 h-full flex flex-col bg-[#0a0a0a]/90 backdrop-blur-xl relative z-10 border border-white/5 shadow-2xl">
                      {isFullAccess && (
                        <div className="flex items-center gap-2 mb-4">
                          <Trophy className="w-4 h-4" style={{ color: discColor }} />
                          <span style={{ color: discColor }} className="text-[10px] font-black uppercase tracking-[0.3em]">Premium</span>
                        </div>
                      )}
                      <p className="text-white font-black text-2xl tracking-tight">{plan.nombrePlan}</p>
                      <div className="mt-4 mb-8">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Inversión</span>
                        <p className="text-5xl font-black text-white mt-2 tracking-tighter">
                          S/ {Number(plan.tarifa)}
                        </p>
                        <span className="text-gray-500 text-sm font-medium">/{plan.duracionDias} días</span>
                      </div>
                      <ul className="space-y-4 flex-1">
                        {feats.map((f, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: destacado ? discColor : '#374151' }} />
                            <span className="text-gray-300 font-medium leading-relaxed">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => abrirPago(plan)}
                        className={`mt-10 w-full py-4 rounded-xl font-black uppercase tracking-[0.1em] text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:-translate-y-1`}
                        style={{ 
                          backgroundColor: destacado ? discColor : 'rgba(255,255,255,0.05)',
                          color: destacado ? '#ffffff' : '#e5e7eb',
                          border: destacado ? 'none' : '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {destacado ? 'Seleccionar Plan' : 'Elegir Plan'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#050505] py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="text-2xl italic-heavy mb-6">GYM<span className="text-blue-600">STAR</span></div>
              <p className="text-gray-500 max-w-sm mb-6 text-sm">Entrena con la mejor tecnología y profesionales dedicados a tu bienestar.</p>
            </div>
            <div>
              <p className="font-bold text-sm uppercase tracking-wider mb-4">Horarios</p>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>Lunes a Viernes: 5am - 11pm</li>
                <li>Sábado: 6am - 10pm</li>
                <li>Domingo: 7am - 2pm</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-wrap justify-between gap-4">
            <p className="text-gray-600 text-xs">© 2026 GYM STAR. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
      {modalRegistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setModalRegistro(false)}></div>
          <motion.div initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-lg p-10 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Elemento decorativo cinemático */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity filter grayscale pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>
            
            <button onClick={() => setModalRegistro(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition z-20 border border-white/10">
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="relative z-10">
              <span className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mb-2 block">Casting Call</span>
              <h3 className="font-black text-4xl mt-1 mb-3 tracking-tighter uppercase text-white">ÚNETE A<br /><span className="text-blue-600">LA ÉLITE</span></h3>
              <p className="text-gray-400 text-sm mb-8 tracking-wide">Acceso inmediato al sistema con tu cuenta de Google. Sin formularios extensos.</p>
              
              {regError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 uppercase tracking-wider text-center font-bold">{regError}</div>}
              
              <div className="flex justify-center bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                <GoogleLogin
                  onSuccess={loginGoogleReal}
                  onError={() => setRegError('No se pudo abrir Google')}
                  theme="filled_black"
                  size="large"
                  shape="rectangular"
                  locale="es"
                  text="continue_with"
                />
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-6 tracking-widest uppercase font-bold">¿Ya eres miembro? <Link to="/login" className="text-white hover:text-blue-600 transition">Inicia Sesión</Link></p>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {planPago && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-md p-8 relative">
            <button onClick={cerrarPago} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
              <X className="w-5 h-5" />
            </button>

            {paso === 'cargando' && (
              <div className="py-16 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Preparando el pago...</p>
              </div>
            )}

            {paso === 'sin-perfil' && (
              <div className="py-10 text-center">
                <h3 className="italic-heavy text-2xl mb-3">COMPLETA TU PERFIL</h3>
                <p className="text-gray-400 text-sm mb-8">Para poder realizar tu compra, es necesario que completes tu perfil ingresando tu DNI en el apartado de tus datos.</p>
                <button onClick={() => { cerrarPago(); navigate('/socio'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-8 py-4 w-full transition-all uppercase">
                  Ir a Mis Datos
                </button>
              </div>
            )}

            {paso === 'instrucciones' && (
              <>
                <h3 className="italic-heavy text-2xl mb-1">PAGO CON YAPE</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Plan <span className="text-white font-bold">{planPago.nombrePlan}</span> · <span className="text-blue-600 font-black">S/ {Number(planPago.tarifa)}</span>
                </p>
                <div className="bg-purple-900/30 border-2 border-purple-500/40 rounded-2xl p-6 mb-6 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-300 text-sm">Yapear a:</p>
                    <p className="text-white font-black text-2xl font-mono">987 654 321</p>
                    <p className="text-purple-400 text-xs font-semibold">GYM STAR S.A.C.</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-5 mb-6">
                  <p className="font-bold text-sm mb-3 text-gray-300">Instrucciones:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                    <li>Abre tu app de <span className="text-purple-400 font-bold">Yape</span></li>
                    <li>Yapea <span className="text-white font-bold">S/ {Number(planPago.tarifa)}</span> al número indicado</li>
                    <li>Referencia: <span className="font-mono text-white">GYM-{planPago.id}</span></li>
                    <li>Presiona <span className="text-blue-600 font-bold">"Ya realicé el pago"</span></li>
                  </ol>
                </div>
                {errorPago && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{errorPago}</div>
                )}
                <div className="flex gap-3">
                  <button onClick={cerrarPago} className="flex-1 py-4 bg-white/10 hover:bg-white/15 rounded-xl font-bold transition">Cancelar</button>
                  <button onClick={confirmarPago} disabled={cargando} className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-black uppercase transition-all disabled:opacity-50">
                    {cargando ? 'Procesando...' : 'Ya realicé el pago'}
                  </button>
                </div>
              </>
            )}

            {paso === 'exito' && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 mx-auto flex items-center justify-center mb-5">
                  <Check className="w-10 h-10" strokeWidth={3} />
                </div>
                <h3 className="italic-heavy text-2xl mb-3">¡PAGO REGISTRADO!</h3>
                <p className="text-gray-400 text-sm mb-8">
                  Tu membresía <span className="text-white font-bold">{planPago.nombrePlan}</span> ha sido activada.
                </p>
                <div className="flex gap-3">
                  <button onClick={cerrarPago} className="flex-1 py-4 bg-white/10 hover:bg-white/15 rounded-xl font-bold transition">Seguir navegando</button>
                  <button onClick={() => { cerrarPago(); navigate('/socio'); }} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase transition-all">
                    Ir a mi panel
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
