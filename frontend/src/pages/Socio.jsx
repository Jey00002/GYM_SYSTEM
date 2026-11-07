import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { 
  User, CreditCard, Activity, Calendar, History, LogOut, 
  Search, Save, Dumbbell, AlertCircle, Trophy,
  CheckCircle2, Circle, Flame, Sparkles, Clock, ChevronRight, Moon, Info,
  Droplets, Utensils, Eye, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../services/api';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const normalizarDia = (dia = '') => {
  if (!dia) return 'LUNES';
  const clean = (dia || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
  if (clean.startsWith('LUN')) return 'LUNES';
  if (clean.startsWith('MAR')) return 'MARTES';
  if (clean.startsWith('MIE') || clean.startsWith('MI')) return 'MIERCOLES';
  if (clean.startsWith('JUE')) return 'JUEVES';
  if (clean.startsWith('VIE')) return 'VIERNES';
  if (clean.startsWith('SAB') || clean.startsWith('S')) return 'SABADO';
  if (clean.startsWith('DOM')) return 'DOMINGO';
  return clean;
};

const getDiaActualNombre = () => {
  const map = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const today = map[new Date().getDay()];
  return today === 'Domingo' ? 'Lunes' : today;
};

const FOTOS_MUSCULOS = {
  PECHO: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=240&auto=format&fit=crop&q=80',
  ESPALDA: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=240&auto=format&fit=crop&q=80',
  PIERNAS: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=240&auto=format&fit=crop&q=80',
  PIERNA: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=240&auto=format&fit=crop&q=80',
  BRAZOS: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=240&auto=format&fit=crop&q=80',
  BRAZO: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=240&auto=format&fit=crop&q=80',
  HOMBROS: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=240&auto=format&fit=crop&q=80',
  HOMBRO: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=240&auto=format&fit=crop&q=80',
  ABDOMEN: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=240&auto=format&fit=crop&q=80',
  CORE: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=240&auto=format&fit=crop&q=80',
  GENERAL: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=240&auto=format&fit=crop&q=80'
};

const resolverFotoEjercicio = (grupoMuscular) => {
  if (!grupoMuscular) return FOTOS_MUSCULOS.GENERAL;
  const g = grupoMuscular.toUpperCase().trim();
  for (const [clave, url] of Object.entries(FOTOS_MUSCULOS)) {
    if (g.includes(clave)) return url;
  }
  return FOTOS_MUSCULOS.GENERAL;
};

const TABS = [
  { id: 'membresia', label: 'Mi Membresía', icon: CreditCard },
  { id: 'rutina', label: 'Mis Rutinas', icon: Dumbbell },
  { id: 'progreso', label: 'Mi Progreso', icon: Activity },
  { id: 'pagos', label: 'Mis Pagos', icon: History },
  { id: 'accesos', label: 'Mis Accesos', icon: Calendar },
  { id: 'datos', label: 'Mis Datos', icon: User },
];

export default function Socio() {
  const [tab, setTab] = useState('membresia');
  const [perfil, setPerfil] = useState(null);
  const [rutina, setRutina] = useState(null);
  const [mediciones, setMediciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [accesos, setAccesos] = useState([]);
  
  // Estado para rutina semanal sectorizada
  const [diaSocioActivo, setDiaSocioActivo] = useState(getDiaActualNombre());
  const [vistaSemanaCompleta, setVistaSemanaCompleta] = useState(false);
  const [actualizandoEjercicio, setActualizandoEjercicio] = useState(null);
  const [ejercicioModal, setEjercicioModal] = useState(null);
  
  // Formulario "Mis Datos"
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    fechaNacimiento: '',
    peso: ''
  });
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState(null); // { type: 'success' | 'error', text: '' }

  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await api.get('/panel-socio/datos');
      const data = res.data;
      
      setPerfil({
        ...data.socio,
        membresiaActiva: data.membresia
      });
      setFormData({
        dni: data.socio.dni || '',
        nombres: data.socio.nombres || '',
        apellidos: data.socio.apellidos || '',
        telefono: data.socio.telefono || '',
        fechaNacimiento: data.socio.fechaNacimiento || '',
        peso: data.mediciones?.length > 0 ? data.mediciones[0].peso : ''
      });
      setRutina(data.rutina);
      setMediciones(data.mediciones || []);
      setPagos(data.pagos || []);
      setAccesos(data.accesos || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const toggleEjercicioCompletado = async (idRutinaEjercicio) => {
    setActualizandoEjercicio(idRutinaEjercicio);
    // Actualización optimista de interfaz
    setRutina(prev => {
      if (!prev || !prev.ejercicios) return prev;
      return {
        ...prev,
        ejercicios: prev.ejercicios.map(e => 
          e.id === idRutinaEjercicio ? { ...e, completado: !e.completado } : e
        )
      };
    });

    try {
      await api.put(`/entrenamiento/ejercicios/${idRutinaEjercicio}/completar`);
    } catch (err) {
      console.error('Error al actualizar estado del ejercicio', err);
      cargarDatos();
    } finally {
      setActualizandoEjercicio(null);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  const buscarDNI = async () => {
    if (!formData.dni || formData.dni.length !== 8) {
      setMensajeForm({ type: 'error', text: 'El DNI debe tener 8 dígitos' });
      return;
    }
    setBuscandoDni(true);
    setMensajeForm(null);
    try {
      const res = await api.get(`/dni/${formData.dni}`);
      setFormData(prev => ({
        ...prev,
        nombres: res.data.nombres,
        apellidos: `${res.data.apellidoPaterno} ${res.data.apellidoMaterno}`
      }));
    } catch (e) {
      setMensajeForm({ type: 'error', text: 'DNI no encontrado o error de red.' });
    } finally {
      setBuscandoDni(false);
    }
  };

  const guardarDatos = async (e) => {
    e.preventDefault();
    if (formData.dni?.length !== 8) return setMensajeForm({ type: 'error', text: 'DNI inválido (8 dígitos).' });
    if (formData.telefono?.length !== 9) return setMensajeForm({ type: 'error', text: 'Teléfono inválido (9 dígitos).' });

    setGuardando(true);
    setMensajeForm(null);
    try {
      await api.put('/panel-socio/perfil', formData);
      setMensajeForm({ type: 'success', text: 'Datos guardados correctamente.' });
      toast.success('¡Perfil actualizado con éxito!');
      cargarDatos();
    } catch (e) {
      setMensajeForm({ type: 'error', text: 'Error al guardar los datos.' });
      toast.error('Error al guardar los datos.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#141414] border-r border-white/5 p-6 flex flex-col">
        <div className="text-2xl font-black tracking-tighter mb-10">
          GYM<span className="text-blue-600">STAR</span>
        </div>
        
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
          <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-600/20">
            {perfil?.nombres ? perfil.nombres.charAt(0) : 'U'}
          </div>
          <div>
            <p className="font-bold">{perfil?.nombres ? perfil.nombres.split(' ')[0] : 'Usuario'}</p>
            <p className="text-xs text-gray-500">Socio</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                  active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" /> {t.label}
              </button>
            );
          })}
        </nav>

        <button 
          onClick={cerrarSesion}
          className="mt-8 flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold w-full"
        >
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={tab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
          
          {tab === 'membresia' && (
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-tighter mb-8">MI MEMBRESÍA</h2>
              {perfil?.membresiaActiva ? (
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl p-8 relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(37,99,235,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] border border-blue-400/30">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-6">
                        <Trophy className="w-5 h-5 text-yellow-300" />
                        <span className="text-yellow-300 font-bold tracking-widest uppercase text-xs">Plan Activo</span>
                      </div>
                      <h3 className="text-4xl font-black mb-2">{perfil.membresiaActiva.nombrePlan || 'Plan GYM'}</h3>
                      <p className="text-white/70 mb-6 font-mono">
                        Vence: {perfil.membresiaActiva.fechaVencimiento || 'N/A'}
                      </p>
                      
                      <div className="inline-flex bg-black/30 rounded-xl p-4 gap-4 items-center border border-white/10">
                        <div className={`w-3 h-3 rounded-full ${perfil.membresiaActiva.estado === 'ACTIVA' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="font-bold">Estado: {perfil.membresiaActiva.estado === 'MOROSO' ? 'INACTIVO' : (perfil.membresiaActiva.estado || 'ACTIVA')}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl flex-shrink-0 shadow-xl">
                      <QRCodeSVG 
                        value={`GYM-${perfil.dni || perfil.id}`} 
                        size={150} 
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                        includeMargin={false}
                      />
                      <p className="text-black text-center text-xs font-bold mt-2 uppercase">Tu código QR</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#141414] border border-white/5 rounded-3xl p-10 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Sin Membresía Activa</h3>
                  <p className="text-gray-400 mb-6">Actualmente no cuentas con un plan activo. Adquiere uno para poder acceder a nuestras instalaciones.</p>
                  <a 
                    href="/#planes"
                    className="inline-block btn-primary px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs"
                  >
                    Adquirir Membresía
                  </a>
                </div>
              )}
            </div>
          )}

          {tab === 'rutina' && (
            <div className="max-w-5xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                      Plan Semanal Sectorizado
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Lunes a Sábado
                    </span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white">MIS RUTINAS</h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Entrenamiento sectorizado por día para optimizar la sobrecarga progresiva y el descanso muscular.
                  </p>
                </div>

                {rutina && (
                  <button
                    onClick={() => setVistaSemanaCompleta(!vistaSemanaCompleta)}
                    className="self-start md:self-auto px-4 py-2.5 btn-secondary rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {vistaSemanaCompleta ? 'Ver por Días Individuales' : 'Ver Toda la Semana'}
                  </button>
                )}
              </div>

              {rutina ? (
                <div className="space-y-6">
                  {/* Tarjeta de Resumen de Rutina */}
                  <div className="bg-gradient-to-br from-[#121212] via-[#0d0d0d] to-[#080808] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 pb-6 border-b border-white/5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-7 h-7 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                              {rutina.estado || 'ACTIVA'}
                            </span>
                            {rutina.fechaAsignacion && (
                              <span className="text-xs font-mono text-gray-500">
                                Asignada: {rutina.fechaAsignacion}
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {rutina.nombreRutina || rutina.nombre || 'Rutina Semanal Integral'}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            Instructor:{' '}
                            <strong className="text-white">
                              {rutina.entrenador?.nombres || rutina.entrenador?.nombre || (typeof rutina.entrenador === 'string' ? rutina.entrenador : 'Instructor del GYM')}
                            </strong>
                            {rutina.entrenador?.especialidad && (
                              <span className="text-gray-500"> ({rutina.entrenador.especialidad})</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Métricas rápidas de la semana */}
                      {(() => {
                        const totalEjercicios = (rutina.ejercicios || []).length;
                        const diasConEjercicio = DIAS_SEMANA.filter(d => 
                          (rutina.ejercicios || []).some(e => normalizarDia(e.diaSemana || 'Lunes') === normalizarDia(d))
                        ).length;
                        const diasDescanso = 6 - diasConEjercicio;
                        const totalCompletados = (rutina.ejercicios || []).filter(e => e.completado).length;

                        return (
                          <div className="grid grid-cols-3 gap-3 bg-black/40 border border-white/5 rounded-2xl p-3.5">
                            <div className="text-center px-2">
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Días Activos</p>
                              <p className="text-xl font-black text-white mt-0.5">{diasConEjercicio}<span className="text-xs text-gray-500 font-normal"> / 6</span></p>
                            </div>
                            <div className="text-center px-2 border-x border-white/5">
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Descanso</p>
                              <p className="text-xl font-black text-blue-400 mt-0.5">{diasDescanso}<span className="text-xs text-gray-500 font-normal"> d.</span></p>
                            </div>
                            <div className="text-center px-2">
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ejercicios</p>
                              <p className="text-xl font-black text-emerald-400 mt-0.5">{totalCompletados}<span className="text-xs text-gray-500 font-normal">/{totalEjercicios}</span></p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Barra Selectora de Días de Lunes a Sábado */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-400" /> Selecciona un Día de Entrenamiento:
                        </label>
                        <span className="text-xs text-gray-500">
                          Hoy es <strong className="text-white">{getDiaActualNombre()}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {DIAS_SEMANA.map((dia) => {
                          const ejsDia = (rutina.ejercicios || []).filter(
                            e => normalizarDia(e.diaSemana || 'Lunes') === normalizarDia(dia)
                          );
                          const count = ejsDia.length;
                          const completadosDia = ejsDia.filter(e => e.completado).length;
                          const todoCompletado = count > 0 && completadosDia === count;
                          const esHoy = normalizarDia(dia) === normalizarDia(getDiaActualNombre());
                          const isActivo = !vistaSemanaCompleta && normalizarDia(diaSocioActivo) === normalizarDia(dia);

                          return (
                            <button
                              key={dia}
                              onClick={() => {
                                setVistaSemanaCompleta(false);
                                setDiaSocioActivo(dia);
                              }}
                              className={`relative p-3.5 rounded-2xl border text-left transition-all active:scale-[0.97] ${
                                isActivo
                                  ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-400/40 shadow-[0_8px_20px_-4px_rgba(37,99,235,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)]'
                                  : 'bg-[#0e0e12]/80 hover:bg-white/5 border-white/10 text-gray-300 hover:text-white shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-xs font-black uppercase tracking-wide truncate">
                                  {dia}
                                </span>
                                {esHoy && (
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                                    isActivo ? 'bg-white text-blue-600' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  }`}>
                                    HOY
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className={`font-medium ${
                                  count > 0 
                                    ? (isActivo ? 'text-white/90' : 'text-gray-400')
                                    : (isActivo ? 'text-white/60' : 'text-gray-600')
                                }`}>
                                  {count > 0 ? `${count} ejercicios` : 'Descanso'}
                                </span>
                                {todoCompletado && (
                                  <CheckCircle2 className={`w-3.5 h-3.5 ${isActivo ? 'text-white' : 'text-emerald-400'}`} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CONTENIDO DEL DÍA O SEMANA COMPLETA */}
                  <div className="space-y-6">
                    {(vistaSemanaCompleta ? DIAS_SEMANA : [diaSocioActivo]).map(dia => {
                      const ejsDia = (rutina.ejercicios || []).filter(
                        e => normalizarDia(e.diaSemana || 'Lunes') === normalizarDia(dia)
                      );
                      const count = ejsDia.length;
                      const completados = ejsDia.filter(e => e.completado).length;
                      const porcentaje = count > 0 ? Math.round((completados / count) * 100) : 0;
                      const esHoy = normalizarDia(dia) === normalizarDia(getDiaActualNombre());

                      // Grupos musculares únicos en este día
                      const gruposDia = Array.from(new Set(
                        ejsDia.map(e => e.ejercicio?.grupoMuscular || e.grupoMuscular || 'General')
                      ));

                      return (
                        <div 
                          key={dia} 
                          className={`bg-[#141414] border rounded-3xl p-6 sm:p-8 transition-all ${
                            esHoy ? 'border-blue-500/40 shadow-xl shadow-blue-500/5' : 'border-white/5'
                          }`}
                        >
                          {/* Cabecera del Día */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/5">
                            <div>
                              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                                  {dia}
                                </h4>
                                {esHoy && (
                                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/30">
                                    Día de Hoy
                                  </span>
                                )}
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                  count > 0 
                                    ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                                    : 'bg-white/5 text-gray-500 border-white/10'
                                }`}>
                                  {count > 0 ? `${count} ejercicios programados` : 'Recuperación Activa'}
                                </span>
                              </div>
                              {gruposDia.length > 0 ? (
                                <p className="text-xs text-gray-400 mt-1">
                                  Enfoque muscular: <strong className="text-blue-400 font-bold">{gruposDia.join(' • ')}</strong>
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500 mt-1">
                                  Día reservado para recuperación física y descanso metabólico.
                                </p>
                              )}
                            </div>

                            {/* Barra de progreso del día */}
                            {count > 0 && (
                              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-3 min-w-[200px]">
                                <div className="flex justify-between items-center text-xs mb-1.5">
                                  <span className="text-gray-400 font-medium">Progreso del día:</span>
                                  <span className="font-bold text-white font-mono">{completados}/{count} ({porcentaje}%)</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                                    style={{ width: `${porcentaje}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Listado de Ejercicios del Día */}
                          {count > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {ejsDia.map((ej, idx) => {
                                const nom = ej.ejercicio?.nombreEjercicio || ej.nombreEjercicio || ej.nombre || 'Ejercicio';
                                const desc = ej.ejercicio?.descripcion || ej.descripcion || 'Ejecutar con rango de movimiento completo y respiración coordinada.';
                                const grupo = ej.ejercicio?.grupoMuscular || ej.grupoMuscular || 'General';
                                const equip = ej.ejercicio?.equipamiento || ej.equipamiento;
                                const musc = ej.ejercicio?.musculoObjetivo || ej.musculoObjetivo;
                                const gif = ej.ejercicio?.urlGif || ej.urlGif || ej.ejercicio?.urlImagen || ej.urlImagen;
                                const completado = Boolean(ej.completado);

                                return (
                                  <div 
                                    key={ej.id || idx}
                                    className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 ${
                                      completado 
                                        ? 'bg-[#0c1610] border-emerald-500/30' 
                                        : 'bg-[#0a0a0a] hover:bg-[#0e0e0e] border-white/5 hover:border-white/10'
                                    }`}
                                  >
                                    <div className="flex gap-4 items-start">
                                      {/* Visual / Thumbnail animado con click para zoom */}
                                      <div 
                                        onClick={() => setEjercicioModal(ej)}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 relative group cursor-pointer"
                                        title="Click para ver animación de técnica completa"
                                      >
                                        <img 
                                          src={gif || resolverFotoEjercicio(grupo)} 
                                          alt={nom} 
                                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${completado ? 'grayscale opacity-60' : ''}`}
                                          loading="lazy"
                                          onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = FOTOS_MUSCULOS.GENERAL;
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <Eye className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-black/70 text-gray-300 border border-white/10 backdrop-blur-sm">
                                          {grupo}
                                        </span>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <span className="text-xs font-mono font-bold text-gray-500">#{idx + 1}</span>
                                          <h5 
                                            onClick={() => setEjercicioModal(ej)}
                                            className={`font-bold text-base truncate cursor-pointer hover:text-blue-400 transition ${completado ? 'line-through text-gray-400' : 'text-white'}`}
                                            title="Ver técnica"
                                          >
                                            {nom}
                                          </h5>
                                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                                            {grupo}
                                          </span>
                                          {equip && (
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/10 text-purple-400 border border-purple-500/20">
                                              {equip}
                                            </span>
                                          )}
                                          {musc && (
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                                              {musc}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                          {desc}
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => setEjercicioModal(ej)}
                                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold mt-1"
                                        >
                                          <Eye className="w-3 h-3" /> Ver animación y técnica
                                        </button>
                                      </div>
                                    </div>

                                    {/* Footer con Sets, Reps y Botón Completado */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                      <div className="flex items-center gap-3">
                                        <div className="text-left">
                                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Series</span>
                                          <span className="text-base font-black text-white">{ej.series} <span className="text-[10px] text-gray-400">sets</span></span>
                                        </div>
                                        <span className="text-gray-700">|</span>
                                        <div className="text-left">
                                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Repeticiones</span>
                                          <span className="text-base font-black text-blue-400">{ej.repeticiones} <span className="text-[10px] text-gray-400">reps</span></span>
                                        </div>
                                      </div>

                                      {/* Botón para marcar completado (RN-18) */}
                                      <button
                                        onClick={() => toggleEjercicioCompletado(ej.id)}
                                        disabled={actualizandoEjercicio === ej.id}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                          completado
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                            : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                                        }`}
                                      >
                                        {completado ? (
                                          <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>Hecho</span>
                                          </>
                                        ) : (
                                          <>
                                            <Circle className="w-4 h-4 text-gray-400" />
                                            <span>Marcar hecho</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            /* Banner de Día de Descanso */
                            <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-2xl p-8 text-center max-w-xl mx-auto">
                              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-400 border border-blue-500/20">
                                <Moon className="w-7 h-7" />
                              </div>
                              <h5 className="font-bold text-lg text-white mb-1">
                                Día de Descanso y Recuperación
                              </h5>
                              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                No tienes ejercicios programados para el <strong className="text-white">{dia}</strong>. El descanso muscular es donde ocurre la hipertrofia y adaptación del tejido.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-gray-400">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <Droplets className="w-3 h-3" />
                                  </span>
                                  <span>Hidratación óptima</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Utensils className="w-3 h-3" />
                                  </span>
                                  <span>Nutrición proteica</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <Moon className="w-3 h-3" />
                                  </span>
                                  <span>7-8h de descanso</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-[#141414] border border-white/5 rounded-3xl p-12 text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 text-blue-400">
                    <Dumbbell className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sin Rutina Asignada</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Aún no tienes un plan de ejercicios semanal asignado. Acércate a tu entrenador o solicítale que configure tu rutina de Lunes a Sábado desde su panel de Entrenador.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'progreso' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl font-black tracking-tighter mb-8">MI PROGRESO</h2>
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-8 mb-8">
                <h3 className="text-gray-400 font-bold mb-6 uppercase text-sm">Historial de Peso (kg)</h3>
                <div className="h-72">
                  {mediciones.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mediciones}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="fechaMedicion" stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                        <YAxis stroke="#666" tick={{fill: '#999', fontSize: 12}} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#38bdf8' }}
                        />
                        <Line type="monotone" dataKey="peso" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">No hay mediciones registradas.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'pagos' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl font-black tracking-tighter mb-8">MIS PAGOS</h2>
              <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0a0a0a] text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="p-5 font-bold">Fecha</th>
                      <th className="p-5 font-bold">Monto</th>
                      <th className="p-5 font-bold">Método</th>
                      <th className="p-5 font-bold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagos.length > 0 ? pagos.map((p, i) => (
                      <tr key={i} className="hover:bg-white/5 transition">
                        <td className="p-5">{p.fechaPago}</td>
                        <td className="p-5 font-bold text-white">S/ {Number(p.monto).toFixed(2)}</td>
                        <td className="p-5">{p.metodoPago?.nombreMetodo || 'N/A'}</td>
                        <td className="p-5"><span className="text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full text-xs">Completado</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay pagos registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'accesos' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl font-black tracking-tighter mb-8">MIS ACCESOS</h2>
              <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0a0a0a] text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="p-5 font-bold">Fecha</th>
                      <th className="p-5 font-bold">Hora Ingreso</th>
                      <th className="p-5 font-bold">Método</th>
                      <th className="p-5 font-bold">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {accesos.length > 0 ? accesos.map((a, i) => (
                      <tr key={i} className="hover:bg-white/5 transition">
                        <td className="p-5">{a.fecha}</td>
                        <td className="p-5">{a.horaIngreso}</td>
                        <td className="p-5">{a.metodoAcceso?.nombreMetodo || 'QR'}</td>
                        <td className="p-5">
                          <span className={`font-bold px-3 py-1 rounded-full text-xs ${a.resultado === 'AUTORIZADO' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                            {a.resultado}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay accesos registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'datos' && (
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-tighter mb-8">MIS DATOS</h2>
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-8">
                {mensajeForm && (
                  <div className={`p-4 rounded-xl mb-6 text-sm ${mensajeForm.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    {mensajeForm.text}
                  </div>
                )}
                <form onSubmit={guardarDatos} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">DNI (Requerido)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          maxLength="8"
                          value={formData.dni} 
                          onChange={e => setFormData({...formData, dni: e.target.value.replace(/\D/g, '')})}
                          className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-600 focus:outline-none" 
                          placeholder="Número de DNI"
                        />
                        <button 
                          type="button" 
                          onClick={buscarDNI} 
                          disabled={buscandoDni || formData.dni.length !== 8}
                          className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" /> {buscandoDni ? '...' : 'Buscar'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombres</label>
                      <input 
                        type="text" 
                        value={formData.nombres} 
                        onChange={e => setFormData({...formData, nombres: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-600 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Apellidos</label>
                      <input 
                        type="text" 
                        value={formData.apellidos} 
                        onChange={e => setFormData({...formData, apellidos: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-600 focus:outline-none" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Teléfono (9 dígitos)</label>
                      <input 
                        type="text" 
                        maxLength="9"
                        value={formData.telefono} 
                        onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-600 focus:outline-none" 
                        placeholder="Ej. 987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Fecha Nacimiento</label>
                      <input 
                        type="date" 
                        value={formData.fechaNacimiento} 
                        onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-600 focus:outline-none" 
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Peso Actual (kg) - Opcional</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.peso} 
                        onChange={e => setFormData({...formData, peso: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-600 focus:outline-none" 
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={guardando}
                    className="mt-6 btn-primary py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50 w-full md:w-auto"
                  >
                    <Save className="w-5 h-5" /> {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              </div>
            </div>
          )}

        {/* Modal de Técnica y Animación GIF para el Socio */}
        {ejercicioModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0b] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-white">
                    {ejercicioModal.ejercicio?.nombreEjercicio || ejercicioModal.nombreEjercicio || ejercicioModal.nombre}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      {ejercicioModal.ejercicio?.grupoMuscular || ejercicioModal.grupoMuscular || 'General'}
                    </span>
                    {(ejercicioModal.ejercicio?.equipamiento || ejercicioModal.equipamiento) && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/10 text-purple-400 border border-purple-500/20">
                        {ejercicioModal.ejercicio?.equipamiento || ejercicioModal.equipamiento}
                      </span>
                    )}
                    {(ejercicioModal.ejercicio?.musculoObjetivo || ejercicioModal.musculoObjetivo) && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                        {ejercicioModal.ejercicio?.musculoObjetivo || ejercicioModal.musculoObjetivo}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setEjercicioModal(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Vista visual animada */}
              <div className="p-4 bg-black flex justify-center items-center border-b border-white/5">
                <div className="w-72 h-72 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center relative">
                  <img 
                    src={ejercicioModal.ejercicio?.urlGif || ejercicioModal.urlGif || ejercicioModal.ejercicio?.urlImagen || ejercicioModal.urlImagen} 
                    alt={ejercicioModal.ejercicio?.nombreEjercicio || ejercicioModal.nombre} 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Explicación técnica */}
              <div className="p-5 space-y-3 max-h-56 overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Objetivo de Sesión:</span>
                  <span className="text-sm font-bold text-white">
                    {ejercicioModal.series} sets × {ejercicioModal.repeticiones} reps
                  </span>
                </div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" /> Instrucciones Técnicas y Postura
                </h5>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {ejercicioModal.ejercicio?.descripcion || ejercicioModal.descripcion || 'Realizar movimiento completo, manteniendo tensión constante y respiración coordinada.'}
                </p>
              </div>

              <div className="p-4 border-t border-white/10 bg-[#070707] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleEjercicioCompletado(ejercicioModal.id);
                    setEjercicioModal(null);
                  }}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Alternar Hecho
                </button>
                <button
                  type="button"
                  onClick={() => setEjercicioModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
