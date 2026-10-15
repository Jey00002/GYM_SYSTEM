import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Check, Trophy, ArrowRight, User, LogOut, ChevronDown, Smartphone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

import heroImg from '../assets/hero.png';

const DURACIONES = [
  { id: 'mes', nombre: 'Mensual', etiqueta: 'Por Mes', dias: 30, descripcion: 'Acceso flexible mensual' },
  { id: 'trimestre', nombre: 'Trimestral', etiqueta: 'Por Trimestre', dias: 90, descripcion: '3 meses con descuento exclusivo' },
  { id: 'anual', nombre: 'Anual', etiqueta: 'Por Anual', dias: 360, descripcion: '360 días con la máxima economía' }
];

const NIVELES = [
  {
    key: 'basico',
    nombre: 'Plan Básico',
    badge: 'Esencial',
    color: '#2563eb',
    beneficios: [
      'Acceso ilimitado a máquinas',
      'Acceso a vestidores y duchas'
    ]
  },
  {
    key: 'dorado',
    nombre: 'Plan Dorado',
    badge: 'Recomendado',
    color: '#eab308',
    beneficios: [
      'Acceso ilimitado a máquinas',
      'Acceso a vestidores y duchas',
      'Evaluación física inicial y mensual',
      'Rutina digital o física personalizada'
    ]
  },
  {
    key: 'diamante',
    nombre: 'Plan Diamante',
    badge: 'VIP Todo Incluido',
    color: '#a855f7',
    beneficios: [
      'Acceso ilimitado a máquinas',
      'Acceso a vestidores y duchas',
      'Evaluación física inicial y mensual',
      'Rutina digital o física personalizada',
      'Acceso a talleres de bailes',
      'Entrenador que te acompaña en toda la sesión de entrenamiento'
    ]
  }
];

const normalizar = (texto = '') => texto
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const obtenerNivel = (nombrePlan = '') => {
  const nombre = normalizar(nombrePlan);
  if (nombre.includes('diamante')) return NIVELES.find(n => n.key === 'diamante');
  if (nombre.includes('dorado')) return NIVELES.find(n => n.key === 'dorado');
  if (nombre.includes('basico') || /b[^a-z0-9]?sico/.test(nombre)) return NIVELES.find(n => n.key === 'basico');
  return null;
};

const parseBeneficios = (plan, fallbackNivel) => {
  if (Array.isArray(plan.beneficios)) return plan.beneficios;
  if (typeof plan.beneficios === 'string' && plan.beneficios.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(plan.beneficios);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  if (typeof plan.beneficios === 'string' && plan.beneficios.trim().length > 0) {
    const lines = plan.beneficios.split('\n').map(s => s.trim()).filter(Boolean);
    if (lines.length > 0) return lines;
  }
  return fallbackNivel?.beneficios || [
    'Acceso ilimitado a máquinas',
    'Acceso a vestidores y duchas'
  ];
};

const resolverNivel = (plan) => {
  const nivelBase = obtenerNivel(plan.nombrePlan);
  const beneficios = parseBeneficios(plan, nivelBase);
  const color = plan.color || nivelBase?.color || '#2563eb';
  const badge = plan.badge || nivelBase?.badge || 'Exclusivo';
  const nombre = plan.nombrePlan || nivelBase?.nombre || 'Plan GymStar';

  return {
    key: nivelBase?.key || `custom-${plan.id}`,
    nombre,
    badge,
    color,
    beneficios
  };
};

const coincideDuracion = (plan, duracion) => {
  const dias = Number(plan.duracionDias);
  const nombre = normalizar(plan.nombrePlan || '');

  if (duracion.id === 'mes') {
    return dias === 30 || (nombre.includes('mensual') && !nombre.includes('trimestral'));
  }
  if (duracion.id === 'trimestre') {
    return dias === 90 || nombre.includes('trimestral');
  }
  if (duracion.id === 'anual') {
    return dias === 360 || dias === 365 || nombre.includes('anual');
  }
  return dias === duracion.dias;
};

const PLANES_DEFAULT = [
  { id: 11, nombrePlan: 'Plan Básico Mensual', duracionDias: 30, tarifa: 80.00 },
  { id: 12, nombrePlan: 'Plan Dorado Mensual', duracionDias: 30, tarifa: 120.00 },
  { id: 13, nombrePlan: 'Plan Diamante Mensual', duracionDias: 30, tarifa: 180.00 },
  { id: 14, nombrePlan: 'Plan Básico Trimestral', duracionDias: 90, tarifa: 210.00 },
  { id: 15, nombrePlan: 'Plan Dorado Trimestral', duracionDias: 90, tarifa: 320.00 },
  { id: 16, nombrePlan: 'Plan Diamante Trimestral', duracionDias: 90, tarifa: 480.00 },
  { id: 17, nombrePlan: 'Plan Básico Anual', duracionDias: 360, tarifa: 720.00 },
  { id: 18, nombrePlan: 'Plan Dorado Anual', duracionDias: 360, tarifa: 1100.00 },
  { id: 19, nombrePlan: 'Plan Diamante Anual', duracionDias: 360, tarifa: 1650.00 }
];

export default function Landing() {
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState('TODOS'); // 'TODOS' | 'mes' | 'trimestre' | 'anual'
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
    setLoadingPlanes(true);
    api.get('/planes').then(r => {
      setPlanes(r.data);
    }).catch(e => {
      console.error("Error cargando planes", e);
    }).finally(() => {
      setLoadingPlanes(false);
    });

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
      
      const email = decodedPayload.email;
      if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
        setRegError('Solo se permiten cuentas con el dominio @gmail.com.');
        return;
      }
      
      const requestData = {
        correo: email.trim().toLowerCase(),
        nombre: decodedPayload.name || decodedPayload.given_name || email.split('@')[0]
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-600/30 font-sans">
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-2xl py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-gradient-to-b from-black/80 to-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-3xl font-black tracking-tighter flex items-center gap-1">
            GYM<span className="text-blue-600">STAR</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.15em]">
            <a href="#inicio" className="text-gray-400 hover:text-blue-500 transition-colors">Inicio</a>
            <a href="#planes" className="text-gray-400 hover:text-blue-500 transition-colors">Membresías</a>
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Nosotros</a>
            
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
            <div className="flex flex-col gap-6 text-xl font-black tracking-tighter">
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
          <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" alt="Gym Hero" className="w-full h-full object-cover kenburns opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
              Gimnasio Premium 24/7
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6 tracking-tighter">
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
          <motion.div {...anim()} className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-blue-500 font-bold tracking-[0.25em] text-xs uppercase">ELIGE TU MEMBRESÍA</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2 mb-4">
              PLANES <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-yellow-400 to-purple-400">EXCLUSIVOS</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              Solo 3 planes diseñados a tu medida: Básico, Dorado y Diamante. Agrupados por mes, trimestre y anual.
            </p>
          </motion.div>

          {/* Selector de periodo: Todos, Por Mes, Por Trimestre, Por Anual */}
          {(() => {
            const listaPlanesTotal = planes.length > 0 ? planes : PLANES_DEFAULT;
            const duracionesDisponibles = [...DURACIONES];
            listaPlanesTotal.forEach(p => {
              const dias = Number(p.duracionDias);
              if (dias && !DURACIONES.some(d => d.dias === dias || coincideDuracion(p, d))) {
                const id = `dias-${dias}`;
                if (!duracionesDisponibles.some(d => d.id === id)) {
                  duracionesDisponibles.push({
                    id,
                    nombre: `${dias} Días`,
                    etiqueta: `Por ${dias} Días`,
                    dias: dias,
                    descripcion: `Membresía por ${dias} días`
                  });
                }
              }
            });

            return (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-16">
                  <button
                    onClick={() => setFiltroPeriodo('TODOS')}
                    className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                      filtroPeriodo === 'TODOS'
                        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    ✨ Todos los Periodos
                  </button>
                  {duracionesDisponibles.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setFiltroPeriodo(d.id)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        filtroPeriodo === d.id
                          ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {d.etiqueta}
                    </button>
                  ))}
                </div>

                {loadingPlanes ? (
                  <div className="py-16 text-center text-gray-400">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-semibold tracking-wide">Cargando planes de membresía...</p>
                  </div>
                ) : (
                  <div className="space-y-24">
                    {(filtroPeriodo === 'TODOS' ? duracionesDisponibles : duracionesDisponibles.filter(d => d.id === filtroPeriodo)).map((duracion, durIdx) => {
                      const planesDeDuracion = listaPlanesTotal
                        .filter(plan => coincideDuracion(plan, duracion))
                        .map(plan => ({ ...plan, nivel: resolverNivel(plan) }))
                        .sort((a, b) => {
                          const orden = { basico: 1, dorado: 2, diamante: 3 };
                          const ordA = orden[a.nivel.key] || 100 + (a.id || 0);
                          const ordB = orden[b.nivel.key] || 100 + (b.id || 0);
                          return ordA - ordB;
                        });
                      return (
                        <div key={duracion.id} className="relative">
                          <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px] font-black uppercase tracking-widest mb-2">
                              {duracion.id === 'mes' ? '1. Planes por Mes' : duracion.id === 'trimestre' ? '2. Planes por Trimestre' : duracion.id === 'anual' ? '3. Planes por Anual' : `Planes por ${duracion.nombre}`}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">{duracion.etiqueta}</h3>
                            <p className="text-gray-400 text-xs md:text-sm mt-1">{duracion.descripcion} · {duracion.dias} días de membresía</p>
                          </div>
                          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
                            <AnimatePresence mode="popLayout">
                              {planesDeDuracion.map((plan, i) => {
                                const esDiamante = plan.nivel.key === 'diamante';
                                const esDorado = plan.nivel.key === 'dorado';
                                const discColor = plan.nivel.color;
                                return (
                                  <motion.div
                                    layout
                                    key={plan.id || `${plan.nivel.key}-${duracion.id}`}
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -30 }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                                    className={`relative rounded-[2rem] p-[1px] group ${esDiamante ? 'lg:scale-105 z-10' : 'z-0'}`}
                                    style={{ 
                                      background: esDiamante 
                                        ? `linear-gradient(135deg, ${discColor}, rgba(168, 85, 247, 0.3) 50%, transparent 80%)` 
                                        : esDorado 
                                        ? `linear-gradient(135deg, ${discColor}, transparent 80%)` 
                                        : `linear-gradient(135deg, ${discColor}80, rgba(255,255,255,0.05) 60%)` 
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none"></div>
                                    <div className="rounded-[calc(2rem-1px)] p-7 h-full flex flex-col bg-[#0d0d0d]/95 backdrop-blur-xl relative z-10 border border-white/5 shadow-2xl">
                                      
                                      <div className="flex items-center justify-between gap-2 mb-3">
                                        <span 
                                          className="text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border"
                                          style={{ 
                                            color: discColor, 
                                            borderColor: `${discColor}40`,
                                            backgroundColor: `${discColor}15`
                                          }}
                                        >
                                          {plan.nivel.badge}
                                        </span>
                                        {esDiamante && (
                                          <div className="flex items-center gap-1" style={{ color: discColor }}>
                                            <Trophy className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Top Tier</span>
                                          </div>
                                        )}
                                      </div>

                                      <p className="text-white font-black text-2xl tracking-tight">{plan.nivel.nombre}</p>
                                      {plan.descripcion && (
                                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{plan.descripcion}</p>
                                      )}
                                      
                                      <div className="mt-4 mb-6 pb-6 border-b border-white/10">
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block">Inversión Total</span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                          <span className="text-lg font-bold text-gray-400">S/</span>
                                          <p className="text-4xl font-black text-white tracking-tighter">
                                            {Number(plan.tarifa)}
                                          </p>
                                          <span className="text-gray-500 text-xs font-medium ml-1">/{duracion.etiqueta.toLowerCase()}</span>
                                        </div>
                                      </div>

                                      <div className="flex-1">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Beneficios incluidos:</p>
                                        <ul className="space-y-3">
                                          {plan.nivel.beneficios.map((f, j) => (
                                            <li key={j} className="flex items-start gap-2.5 text-sm">
                                              <div 
                                                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={{ backgroundColor: `${discColor}20`, color: discColor }}
                                              >
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                              </div>
                                              <span className="text-gray-300 text-xs font-medium leading-relaxed">{f}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <button
                                        onClick={() => abrirPago(plan)}
                                        className="mt-8 w-full py-3.5 rounded-xl font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
                                        style={{
                                          backgroundColor: esDiamante ? discColor : esDorado ? '#eab308' : (plan.nivel.color || '#2563eb'),
                                          color: esDorado ? '#000000' : '#ffffff',
                                          fontWeight: 900
                                        }}
                                      >
                                        Adquirir {plan.nivel.nombre}
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                            {planesDeDuracion.length === 0 && (
                              <div className="col-span-full py-12 text-center text-gray-500">
                                No hay planes disponibles para esta duración en este momento.
                              </div>
                            )}
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      <footer className="bg-[#020202] py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-blue-600/50 to-transparent"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-8">
            <div className="md:col-span-2">
              <div className="text-3xl font-black tracking-tighter mb-6 flex items-center gap-1">GYM<span className="text-blue-600">STAR</span></div>
              <p className="text-gray-400 max-w-sm mb-8 text-sm leading-relaxed">Elevando el estándar del fitness en Latinoamérica. Tecnología de punta, infraestructura premium y el mejor equipo de profesionales enfocados en tu rendimiento.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors cursor-pointer text-gray-400 hover:text-white">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors cursor-pointer text-gray-400 hover:text-white">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors cursor-pointer text-gray-400 hover:text-white">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors cursor-pointer text-gray-400 hover:text-white">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                </a>
              </div>
            </div>
            
            <div>
              <p className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-white">Compañía</p>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Prensa</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-white">Servicios</p>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Planes Corporativos</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Entrenamiento Personal</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Nutrición Deportiva</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Fisioterapia</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-white">Horarios</p>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Lun - Vie</span><span className="text-white font-medium">05:00 - 23:00</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Sábados</span><span className="text-white font-medium">06:00 - 22:00</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Domingos</span><span className="text-white font-medium">07:00 - 14:00</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs font-medium">© {new Date().getFullYear()} GYM STAR LLC. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-xs text-gray-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
      {modalRegistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setModalRegistro(false)}></div>
          <motion.div initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-lg p-10 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Elemento decorativo cinemático */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"></div>
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
              
              <p className="text-center text-xs text-gray-500 mt-6 tracking-widest uppercase font-bold">
                ¿Ya eres miembro? <Link to="/login" className="text-white hover:text-blue-600 transition">Inicia Sesión</Link>
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <Link 
                  to="/login?modo=registro" 
                  onClick={() => setModalRegistro(false)} 
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition inline-block"
                >
                  ¿No tienes cuenta? Crear con correo Gmail
                </Link>
              </div>
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
                <h3 className="font-black tracking-tighter text-2xl mb-3">COMPLETA TU PERFIL</h3>
                <p className="text-gray-400 text-sm mb-8">Para poder realizar tu compra, es necesario que completes tu perfil ingresando tu DNI en el apartado de tus datos.</p>
                <button onClick={() => { cerrarPago(); navigate('/socio'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-8 py-4 w-full transition-all uppercase">
                  Ir a Mis Datos
                </button>
              </div>
            )}

            {paso === 'instrucciones' && (
              <>
                <h3 className="font-black tracking-tighter text-2xl mb-1">PAGO CON YAPE</h3>
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
                <h3 className="font-black tracking-tighter text-2xl mb-3">¡PAGO REGISTRADO!</h3>
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
