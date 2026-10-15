import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, TrendingUp, AlertTriangle, LogOut, ArrowRight, Activity, DollarSign,
  Layers, Plus, Edit2, Trash2, Check, RefreshCw, Eye, EyeOff, Sparkles, Tag,
  X, ChevronRight, Dumbbell, ShieldCheck, Info
} from 'lucide-react';
import api from '../services/api';

const MESES = { '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun','07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic' };
const COLORES_ESTADO = { ACTIVA: '#22c55e', MOROSO: '#ef4444', VENCIDA: '#ef4444', SUSPENDIDA: '#2563eb' };

const PALETA_COLORES = [
  { nombre: 'Azul Élite', hex: '#2563eb' },
  { nombre: 'Dorado Solar', hex: '#eab308' },
  { nombre: 'Púrpura VIP', hex: '#a855f7' },
  { nombre: 'Verde Esmeralda', hex: '#10b981' },
  { nombre: 'Naranja Fuego', hex: '#f97316' },
  { nombre: 'Rosa Eléctrico', hex: '#ec4899' },
  { nombre: 'Cian Neón', hex: '#06b6d4' }
];

const PRESETS_BADGE = [
  'Esencial', 'Recomendado', 'VIP Todo Incluido', 'Más Popular', 'Top Tier', 'Promoción'
];

const SUGERENCIAS_BENEFICIOS = [
  'Acceso ilimitado a máquinas',
  'Acceso a vestidores y duchas',
  'Evaluación física inicial y mensual',
  'Rutina digital o física personalizada',
  'Acceso a talleres de bailes',
  'Entrenador que te acompaña en toda la sesión',
  'Acceso a zona de sauna y spa',
  'Casillero privado y toallas',
  'Bebidas hidratantes ilimitadas'
];

export default function DashboardGerente() {
  const [seccion, setSeccion] = useState('resumen'); // 'resumen' | 'planes'
  const [dashboard, setDashboard] = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [ventasDisciplina, setVentasDisciplina] = useState([]);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Estados de gestión de planes
  const [planes, setPlanes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState('TODOS'); // 'TODOS' | '30' | '90' | '360' | 'otros'
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'activos' | 'inactivos'
  const [busqueda, setBusqueda] = useState('');
  
  // Modal edición / creación
  const [modalPlan, setModalPlan] = useState(false);
  const [planEditando, setPlanEditando] = useState({
    id: null,
    nombrePlan: '',
    duracionDias: 30,
    tarifa: '',
    badge: 'Recomendado',
    color: '#2563eb',
    descripcion: '',
    estado: true,
    idDisciplina: null,
    beneficios: []
  });
  const [nuevoBeneficio, setNuevoBeneficio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [notificacion, setNotificacion] = useState(null);

  const navigate = useNavigate();

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => {
      setNotificacion(null);
    }, 4500);
  };

  const cargarResumen = async () => {
    try {
      const [d, i, m, vd] = await Promise.all([
        api.get('/reportes/dashboard').catch(() => ({ data: { aforoActual: 0, aforoMaximo: 100, ingresosMensuales: 0, sociosActivos: 0, proximosVencimientos: [] }})),
        api.get('/reportes/ingresos-mensuales').catch(() => ({ data: [] })),
        api.get('/reportes/membresias-estado').catch(() => ({ data: [] })),
        api.get('/reportes/por-disciplina').catch(() => ({ data: [] }))
      ]);
      
      setDashboard(d.data);
      setIngresos(i.data.map(x => ({
        mes: MESES[x.mes.split('-')[1]] || x.mes,
        ingresos: Number(x.total)
      })));
      setMembresias(m.data.map(x => ({
        name: x.estado,
        value: Number(x.total),
        color: COLORES_ESTADO[x.estado] || '#2563eb'
      })));
      setVentasDisciplina(vd.data);
      setError(false);
    } catch (e) {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  const cargarPlanes = async () => {
    setCargandoPlanes(true);
    try {
      const [resPlanes, resDisc] = await Promise.all([
        api.get('/planes/todos'),
        api.get('/disciplinas').catch(() => ({ data: [] }))
      ]);
      setPlanes(resPlanes.data || []);
      setDisciplinas(resDisc.data || []);
    } catch (e) {
      mostrarNotificacion('error', 'Error al cargar los planes de membresía.');
    } finally {
      setCargandoPlanes(false);
    }
  };

  useEffect(() => {
    cargarResumen();
    cargarPlanes();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  const parseBeneficios = (b) => {
    if (Array.isArray(b)) return b;
    if (typeof b === 'string' && b.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(b);
        if (Array.isArray(arr)) return arr;
      } catch (e) {}
    }
    if (typeof b === 'string' && b.trim().length > 0) {
      return b.split('\n').map(x => x.trim()).filter(Boolean);
    }
    return [];
  };

  const abrirEditarPlan = (plan) => {
    setPlanEditando({
      id: plan.id,
      nombrePlan: plan.nombrePlan || '',
      duracionDias: plan.duracionDias || 30,
      tarifa: plan.tarifa !== undefined ? plan.tarifa : '',
      badge: plan.badge || 'Recomendado',
      color: plan.color || '#2563eb',
      descripcion: plan.descripcion || '',
      estado: plan.estado ?? true,
      idDisciplina: plan.disciplina?.id || (disciplinas[0]?.id || null),
      beneficios: parseBeneficios(plan.beneficios)
    });
    setNuevoBeneficio('');
    setModalPlan(true);
  };

  const abrirNuevoPlan = () => {
    setPlanEditando({
      id: null,
      nombrePlan: '',
      duracionDias: 30,
      tarifa: '',
      badge: 'Nuevo',
      color: '#2563eb',
      descripcion: '',
      estado: true,
      idDisciplina: disciplinas[0]?.id || null,
      beneficios: [
        'Acceso ilimitado a máquinas',
        'Acceso a vestidores y duchas'
      ]
    });
    setNuevoBeneficio('');
    setModalPlan(true);
  };

  const agregarBeneficio = (texto) => {
    const item = (texto || nuevoBeneficio).trim();
    if (!item) return;
    if (planEditando.beneficios.includes(item)) return;
    setPlanEditando(prev => ({
      ...prev,
      beneficios: [...prev.beneficios, item]
    }));
    setNuevoBeneficio('');
  };

  const eliminarBeneficio = (indice) => {
    setPlanEditando(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, idx) => idx !== indice)
    }));
  };

  const alternarEstadoPlan = async (plan) => {
    try {
      const res = await api.patch(`/planes/${plan.id}/estado`);
      mostrarNotificacion('exito', res.data?.mensaje || 'Estado del plan actualizado correctamente.');
      cargarPlanes();
    } catch (err) {
      mostrarNotificacion('error', 'No se pudo cambiar el estado del plan.');
    }
  };

  const guardarPlan = async (e) => {
    e?.preventDefault();
    if (!planEditando.nombrePlan.trim()) {
      mostrarNotificacion('error', 'El nombre del plan no puede estar vacío.');
      return;
    }
    if (planEditando.tarifa === '' || Number(planEditando.tarifa) < 0) {
      mostrarNotificacion('error', 'La tarifa del plan debe ser un número positivo.');
      return;
    }
    if (!planEditando.duracionDias || Number(planEditando.duracionDias) <= 0) {
      mostrarNotificacion('error', 'La duración en días debe ser mayor a 0.');
      return;
    }
    if (planEditando.beneficios.length === 0) {
      mostrarNotificacion('error', 'Debes incluir al menos una característica o beneficio.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        nombrePlan: planEditando.nombrePlan.trim(),
        duracionDias: Number(planEditando.duracionDias),
        tarifa: Number(planEditando.tarifa),
        badge: planEditando.badge?.trim() || 'Exclusivo',
        color: planEditando.color?.trim() || '#2563eb',
        descripcion: planEditando.descripcion?.trim() || '',
        estado: planEditando.estado ?? true,
        idDisciplina: planEditando.idDisciplina,
        beneficios: planEditando.beneficios
      };

      if (planEditando.id) {
        await api.put(`/planes/${planEditando.id}`, payload);
        mostrarNotificacion('exito', '¡Plan actualizado con éxito! Los cambios se reflejan automáticamente en la página principal.');
      } else {
        await api.post('/planes', payload);
        mostrarNotificacion('exito', '¡Nuevo plan de membresía creado! Ya se encuentra visible para los usuarios en la web.');
      }
      setModalPlan(false);
      cargarPlanes();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error al guardar el plan.';
      mostrarNotificacion('error', msg);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminarPlan = async () => {
    if (!modalEliminar) return;
    try {
      const res = await api.delete(`/planes/${modalEliminar.id}`);
      mostrarNotificacion('exito', res.data?.mensaje || 'Operación completada con éxito.');
      setModalEliminar(null);
      cargarPlanes();
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo eliminar el plan.';
      mostrarNotificacion('error', msg);
      setModalEliminar(null);
    }
  };

  // Filtrado de planes para la vista
  const planesFiltrados = planes.filter(p => {
    // Filtro por duración
    const dias = Number(p.duracionDias);
    if (filtroPeriodo === '30' && dias !== 30) return false;
    if (filtroPeriodo === '90' && dias !== 90) return false;
    if (filtroPeriodo === '360' && dias !== 360 && dias !== 365) return false;
    if (filtroPeriodo === 'otros' && (dias === 30 || dias === 90 || dias === 360 || dias === 365)) return false;

    // Filtro por estado
    if (filtroEstado === 'activos' && !p.estado) return false;
    if (filtroEstado === 'inactivos' && p.estado) return false;

    // Búsqueda por texto
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const nombre = (p.nombrePlan || '').toLowerCase();
      const badge = (p.badge || '').toLowerCase();
      const desc = (p.descripcion || '').toLowerCase();
      const ben = parseBeneficios(p.beneficios).join(' ').toLowerCase();
      return nombre.includes(q) || badge.includes(q) || desc.includes(q) || ben.includes(q);
    }
    return true;
  });

  const totalPlanes = planes.length;
  const planesActivos = planes.filter(p => p.estado).length;
  const planesInactivos = planes.filter(p => !p.estado).length;
  const tarifaPromedio = planes.length > 0
    ? (planes.reduce((acc, p) => acc + Number(p.tarifa || 0), 0) / planes.length).toFixed(2)
    : '0.00';

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col md:flex-row">
      {/* Toast Notification */}
      <AnimatePresence>
        {notificacion && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              notificacion.tipo === 'exito'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/90 border-red-500/40 text-red-200'
            }`}
          >
            {notificacion.tipo === 'exito' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <p className="text-sm font-semibold tracking-wide">{notificacion.mensaje}</p>
            <button onClick={() => setNotificacion(null)} className="ml-2 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#141414] border-r border-white/5 p-6 flex flex-col">
        <div className="text-2xl font-black tracking-tighter mb-10 flex items-center gap-1">
          GYM<span className="text-blue-600">STAR</span>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            GERENCIA
          </span>
        </div>
        
        <div className="flex-1 space-y-2">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Panel de Control</p>
          
          <button 
            onClick={() => setSeccion('resumen')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
              seccion === 'resumen' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-5 h-5" /> Resumen
          </button>

          <button 
            onClick={() => setSeccion('planes')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-bold ${
              seccion === 'planes' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Layers className="w-5 h-5" /> Planes de Membresía
            </span>
            <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/10 font-mono">
              {planes.length}
            </span>
          </button>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-2">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
            title="Ir a la página principal pública"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" /> Ver Página Web
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
          </button>

          <button 
            onClick={cerrarSesion}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold w-full"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* SECCIÓN 1: RESUMEN / VISIÓN GENERAL */}
          {seccion === 'resumen' && (
            <>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Visión General</h2>
                  <p className="text-gray-400 text-sm">Monitoreo en tiempo real de operaciones y finanzas.</p>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {error && (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-8 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" /> Hubo un error cargando algunos reportes. Mostrando datos disponibles.
                  </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-600/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Aforo Actual</p>
                    <div className="flex items-baseline gap-2 relative z-10">
                      <h3 className="text-4xl font-black tracking-tighter">{dashboard?.aforoActual || 0}</h3>
                      <span className="text-gray-500 font-medium">/ {dashboard?.aforoMaximo || 100}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Ingresos del Mes</p>
                    <h3 className="text-4xl font-black tracking-tighter relative z-10">S/ {Number(dashboard?.ingresosMensuales || 0).toFixed(2)}</h3>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Socios Activos</p>
                    <h3 className="text-4xl font-black tracking-tighter relative z-10">{dashboard?.sociosActivos || 0}</h3>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* GRAFICO INGRESOS */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl shadow-2xl p-6 lg:col-span-2">
                    <h3 className="text-gray-400 font-bold mb-6 uppercase text-sm tracking-wider">Ingresos por Mes</h3>
                    <div className="h-64">
                      {ingresos.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ingresos}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="mes" stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                            <YAxis stroke="#666" tick={{fill: '#999', fontSize: 12}} tickFormatter={(v) => `S/${v}`} />
                            <Tooltip 
                              cursor={{fill: 'rgba(255,255,255,0.05)'}}
                              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                              itemStyle={{ color: '#2563eb' }}
                            />
                            <Bar dataKey="ingresos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">Sin datos de ingresos</div>
                      )}
                    </div>
                  </motion.div>

                  {/* ESTADOS MEMBRESIA PIE */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl shadow-2xl p-6">
                    <h3 className="text-gray-400 font-bold mb-6 uppercase text-sm tracking-wider">Estados de Membresía</h3>
                    <div className="h-64 relative">
                      {membresias.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={membresias}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {membresias.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">Sin datos</div>
                      )}
                      {membresias.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <p className="text-2xl font-black tracking-tighter">{membresias.reduce((a, b) => a + b.value, 0)}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* VENTAS POR DISCIPLINA */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl shadow-2xl p-6">
                    <h3 className="text-gray-400 font-bold mb-6 uppercase text-sm tracking-wider">Ventas por Disciplina</h3>
                    <div className="h-64">
                      {ventasDisciplina.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ventasDisciplina} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                            <XAxis type="number" stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                            <YAxis dataKey="nombre" type="category" stroke="#666" tick={{fill: '#999', fontSize: 12}} width={80} />
                            <Tooltip 
                              cursor={{fill: 'rgba(255,255,255,0.05)'}}
                              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                              formatter={(val) => [`S/ ${val}`, 'Ingresos']}
                            />
                            <Bar dataKey="ingreso_total" radius={[0, 4, 4, 0]}>
                              {ventasDisciplina.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || '#2563eb'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">Sin datos</div>
                      )}
                    </div>
                  </motion.div>

                  {/* MEMBRESÍAS POR VENCER */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl shadow-2xl p-6">
                    <h3 className="text-gray-400 font-bold mb-6 uppercase text-sm tracking-wider">Próximos Vencimientos</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 border-b border-white/5">
                          <tr>
                            <th className="pb-3 font-bold uppercase text-xs tracking-wider">Socio</th>
                            <th className="pb-3 font-bold uppercase text-xs tracking-wider">Vence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {dashboard?.proximosVencimientos?.length > 0 ? (
                            dashboard.proximosVencimientos.map((v, i) => (
                              <tr key={i} className="hover:bg-white/5 transition">
                                <td className="py-4">
                                  <p className="font-bold">{v.socio?.nombres} {v.socio?.apellidos}</p>
                                  <p className="text-xs text-gray-500 font-mono">{v.socio?.dni}</p>
                                </td>
                                <td className="py-4">
                                  <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-xs font-bold border border-red-500/20">
                                    {v.fechaVencimiento}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="2" className="py-8 text-center text-gray-500">No hay vencimientos cercanos.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}

          {/* SECCIÓN 2: GESTIÓN DE PLANES DE MEMBRESÍA */}
          {seccion === 'planes' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header de Planes */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Administrador de Ofertas & Tarifas
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase">Planes de Membresía</h2>
                  <p className="text-gray-400 text-sm">
                    Modifica precios, beneficios, insignias y visibilidad en tiempo real para la página principal.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={cargarPlanes}
                    disabled={cargandoPlanes}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white transition disabled:opacity-50"
                    title="Recargar planes"
                  >
                    <RefreshCw className={`w-4 h-4 ${cargandoPlanes ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={abrirNuevoPlan}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg shadow-blue-600/30 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" /> Nuevo Plan
                  </button>
                </div>
              </div>

              {/* KPIs de Planes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total de Planes</p>
                  <p className="text-3xl font-black text-white">{totalPlanes}</p>
                </div>
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Planes Activos</p>
                  <p className="text-3xl font-black text-emerald-400">{planesActivos}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Visibles en la web</p>
                </div>
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Planes Ocultos</p>
                  <p className="text-3xl font-black text-gray-400">{planesInactivos}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Desactivados</p>
                </div>
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Tarifa Promedio</p>
                  <p className="text-3xl font-black text-blue-400">S/ {tarifaPromedio}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Promedio general</p>
                </div>
              </div>

              {/* Filtros y Búsqueda */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Duración */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  <button
                    onClick={() => setFiltroPeriodo('TODOS')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filtroPeriodo === 'TODOS'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroPeriodo('30')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filtroPeriodo === '30'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Mensual (30d)
                  </button>
                  <button
                    onClick={() => setFiltroPeriodo('90')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filtroPeriodo === '90'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Trimestral (90d)
                  </button>
                  <button
                    onClick={() => setFiltroPeriodo('360')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filtroPeriodo === '360'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Anual (360d)
                  </button>
                  <button
                    onClick={() => setFiltroPeriodo('otros')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filtroPeriodo === 'otros'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Otros
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Filtro estado */}
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="activos">Solo Activos (Visibles)</option>
                    <option value="inactivos">Solo Inactivos (Ocultos)</option>
                  </select>

                  {/* Input de búsqueda */}
                  <div className="relative flex-1 md:w-48">
                    <input
                      type="text"
                      placeholder="Buscar plan o beneficio..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    {busqueda && (
                      <button onClick={() => setBusqueda('')} className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid de Cards de Planes */}
              {cargandoPlanes ? (
                <div className="py-20 text-center text-gray-400">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm">Cargando planes de membresía...</p>
                </div>
              ) : planesFiltrados.length === 0 ? (
                <div className="py-20 text-center bg-[#141414] border border-white/5 rounded-3xl p-8">
                  <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-300 mb-2">No se encontraron planes</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    No hay planes que coincidan con los filtros seleccionados. Puedes crear un nuevo plan o ajustar tus filtros.
                  </p>
                  <button
                    onClick={abrirNuevoPlan}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Crear Primer Plan
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {planesFiltrados.map((plan) => {
                    const beneficios = parseBeneficios(plan.beneficios);
                    const colorPlan = plan.color || '#2563eb';
                    const badgePlan = plan.badge || 'Exclusivo';

                    return (
                      <motion.div
                        layout
                        key={plan.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-[#141414] border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative group hover:border-white/20 shadow-xl ${
                          plan.estado ? 'border-white/10' : 'border-red-500/20 opacity-75 bg-[#111111]'
                        }`}
                      >
                        {/* Indicador superior */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span 
                              className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                              style={{ 
                                color: colorPlan, 
                                borderColor: `${colorPlan}40`,
                                backgroundColor: `${colorPlan}15`
                              }}
                            >
                              {badgePlan}
                            </span>

                            <button
                              onClick={() => alternarEstadoPlan(plan)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                                plan.estado 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                              }`}
                              title={plan.estado ? 'Desactivar plan (ocultar de la web)' : 'Activar plan (mostrar en la web)'}
                            >
                              {plan.estado ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              {plan.estado ? 'Activo' : 'Oculto'}
                            </button>
                          </div>

                          <h3 className="text-xl font-black tracking-tight text-white mb-1">
                            {plan.nombrePlan}
                          </h3>

                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-[11px] text-gray-300">
                              {plan.duracionDias} días
                            </span>
                            <span>·</span>
                            <span>{plan.disciplina?.nombre || 'General'}</span>
                          </div>

                          {plan.descripcion && (
                            <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                              {plan.descripcion}
                            </p>
                          )}

                          {/* Precio */}
                          <div className="py-4 border-y border-white/5 mb-5 flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-gray-500 block">Tarifa Oficial</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-gray-400">S/</span>
                                <span className="text-3xl font-black text-white tracking-tighter">
                                  {Number(plan.tarifa).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <span className="text-xs text-gray-500 font-medium">
                              {plan.duracionDias <= 30 ? 'por mes' : plan.duracionDias <= 90 ? 'por trimestre' : 'por año'}
                            </span>
                          </div>

                          {/* Lista de características / beneficios */}
                          <div className="mb-6">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
                              <span>Características ({beneficios.length})</span>
                            </p>
                            <ul className="space-y-2">
                              {beneficios.slice(0, 4).map((b, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2 text-xs text-gray-300">
                                  <div 
                                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: `${colorPlan}20`, color: colorPlan }}
                                  >
                                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                  </div>
                                  <span className="line-clamp-1">{b}</span>
                                </li>
                              ))}
                              {beneficios.length > 4 && (
                                <p className="text-[10px] text-gray-500 italic pl-5">
                                  +{beneficios.length - 4} características adicionales...
                                </p>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                          <button
                            onClick={() => abrirEditarPlan(plan)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 hover:text-white text-gray-300 rounded-xl text-xs font-bold transition border border-white/5"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Editar
                          </button>

                          <button
                            onClick={() => setModalEliminar(plan)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition border border-red-500/20"
                            title="Eliminar o desactivar plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>

      {/* MODAL DE EDICIÓN / CREACIÓN DE PLAN */}
      <AnimatePresence>
        {modalPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalPlan(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col relative z-10 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    {planEditando.id ? 'Editar Plan de Membresía' : 'Crear Nuevo Plan de Membresía'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Los cambios se verán reflejados al instante en la landing page principal.
                  </p>
                </div>
                <button
                  onClick={() => setModalPlan(false)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Formulario + Vista Previa en Vivo */}
              <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Formulario (7 columnas) */}
                <form onSubmit={guardarPlan} className="lg:col-span-7 space-y-5">
                  {/* Nombre del Plan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Nombre del Plan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Plan Dorado Mensual"
                      value={planEditando.nombrePlan}
                      onChange={(e) => setPlanEditando({ ...planEditando, nombrePlan: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Fila: Precio (Tarifa) y Duración */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Precio / Tarifa (S/) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">S/</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="120.00"
                          value={planEditando.tarifa}
                          onChange={(e) => setPlanEditando({ ...planEditando, tarifa: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Duración (Días) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="30"
                        value={planEditando.duracionDias}
                        onChange={(e) => setPlanEditando({ ...planEditando, duracionDias: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Botones rápidos de duración */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 font-bold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setPlanEditando({ ...planEditando, duracionDias: 30 })}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-gray-300 transition"
                    >
                      30d (Mes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanEditando({ ...planEditando, duracionDias: 90 })}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-gray-300 transition"
                    >
                      90d (Trimestre)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanEditando({ ...planEditando, duracionDias: 360 })}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-gray-300 transition"
                    >
                      360d (Año)
                    </button>
                  </div>

                  {/* Fila: Insignia (Badge) y Color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Insignia / Badge
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Recomendado, VIP"
                        value={planEditando.badge}
                        onChange={(e) => setPlanEditando({ ...planEditando, badge: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Color Distintivo
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={planEditando.color}
                          onChange={(e) => setPlanEditando({ ...planEditando, color: e.target.value })}
                          className="w-11 h-11 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={planEditando.color}
                          onChange={(e) => setPlanEditando({ ...planEditando, color: e.target.value })}
                          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Presets de Color e Insignia */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-500 font-bold uppercase">Colores:</span>
                    {PALETA_COLORES.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setPlanEditando({ ...planEditando, color: c.hex })}
                        className="w-5 h-5 rounded-full border border-white/20 transition hover:scale-125"
                        style={{ backgroundColor: c.hex }}
                        title={c.nombre}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 font-bold uppercase">Badges:</span>
                    {PRESETS_BADGE.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setPlanEditando({ ...planEditando, badge: b })}
                        className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-gray-300 transition"
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  {/* Descripción Breve */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Descripción Breve (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Plan completo con asesoramiento y rutinas personalizadas"
                      value={planEditando.descripcion}
                      onChange={(e) => setPlanEditando({ ...planEditando, descripcion: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Disciplina */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Disciplina Asociada
                    </label>
                    <select
                      value={planEditando.idDisciplina || ''}
                      onChange={(e) => setPlanEditando({ ...planEditando, idDisciplina: e.target.value ? Number(e.target.value) : null })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      {disciplinas.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre} ({d.descripcion})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Editor Dinámico de Características / Beneficios */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
                      <span>Características que incluye el plan ({planEditando.beneficios.length}) *</span>
                      <span className="text-[10px] text-blue-400 normal-case font-normal">Agrega o elimina viñetas</span>
                    </label>

                    {/* Input para nuevo beneficio */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Escribe una nueva característica (ej: Acceso a piscina)..."
                        value={nuevoBeneficio}
                        onChange={(e) => setNuevoBeneficio(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            agregarBeneficio();
                          }
                        }}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => agregarBeneficio()}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
                      >
                        + Agregar
                      </button>
                    </div>

                    {/* Chips con sugerencias rápidas */}
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">Sugerencias rápidas:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGERENCIAS_BENEFICIOS.map((sug, sIdx) => {
                          const yaIncluido = planEditando.beneficios.includes(sug);
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              disabled={yaIncluido}
                              onClick={() => agregarBeneficio(sug)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                                yaIncluido
                                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                  : 'bg-white/5 text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 border border-white/5'
                              }`}
                            >
                              {yaIncluido ? <Check className="w-3 h-3" /> : '+'} {sug}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lista actual de beneficios editables */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {planEditando.beneficios.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-gray-200 group hover:border-white/20 transition"
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{ backgroundColor: `${planEditando.color}30`, color: planEditando.color }}
                            >
                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                            </span>
                            <span>{b}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarBeneficio(bIdx)}
                            className="text-gray-500 hover:text-red-400 transition p-1"
                            title="Eliminar característica"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Toggle de Estado Activo / Visible */}
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition">
                      <input
                        type="checkbox"
                        checked={planEditando.estado}
                        onChange={(e) => setPlanEditando({ ...planEditando, estado: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded bg-black/40 border-white/10 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Activo en la Página Principal (Visible para el público)
                        </span>
                        <span className="text-[11px] text-gray-400 block">
                          Si se desactiva, los usuarios en la web no podrán ver ni comprar este plan.
                        </span>
                      </div>
                    </label>
                  </div>
                </form>

                {/* Columna Derecha: Vista Previa en Vivo (5 columnas) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-start border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                  <div className="w-full text-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10 inline-flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-blue-500" /> Vista Previa en Página Principal
                    </span>
                  </div>

                  {/* Card Previsualizada */}
                  <div 
                    className="w-full rounded-[2rem] p-[1px] relative shadow-2xl transition-all duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${planEditando.color || '#2563eb'}, rgba(255,255,255,0.05) 70%)` 
                    }}
                  >
                    <div className="rounded-[calc(2rem-1px)] p-6 h-full flex flex-col bg-[#0d0d0d]/95 backdrop-blur-xl relative z-10 border border-white/5">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span 
                          className="text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border"
                          style={{ 
                            color: planEditando.color || '#2563eb', 
                            borderColor: `${planEditando.color || '#2563eb'}40`,
                            backgroundColor: `${planEditando.color || '#2563eb'}15`
                          }}
                        >
                          {planEditando.badge || 'Exclusivo'}
                        </span>
                        
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                          {planEditando.duracionDias} DÍAS
                        </span>
                      </div>

                      <p className="text-white font-black text-xl tracking-tight">
                        {planEditando.nombrePlan || 'Nombre del Plan'}
                      </p>

                      {planEditando.descripcion && (
                        <p className="text-gray-400 text-xs mt-1 mb-2 leading-relaxed">
                          {planEditando.descripcion}
                        </p>
                      )}

                      <div className="mt-3 mb-4 pb-4 border-b border-white/10">
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block">Inversión Total</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-bold text-gray-400">S/</span>
                          <p className="text-3xl font-black text-white tracking-tighter">
                            {planEditando.tarifa ? Number(planEditando.tarifa).toFixed(2) : '0.00'}
                          </p>
                          <span className="text-gray-500 text-xs font-medium ml-1">
                            /{planEditando.duracionDias <= 30 ? 'mes' : planEditando.duracionDias <= 90 ? 'trimestre' : 'año'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Beneficios incluidos:</p>
                        <ul className="space-y-2">
                          {(planEditando.beneficios.length > 0 ? planEditando.beneficios : ['Sin características agregadas']).map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs">
                              <div 
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ 
                                  backgroundColor: `${planEditando.color || '#2563eb'}20`, 
                                  color: planEditando.color || '#2563eb' 
                                }}
                              >
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              </div>
                              <span className="text-gray-300 text-xs font-medium leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className="mt-6 w-full py-3 rounded-xl font-black uppercase tracking-[0.12em] text-xs transition-all shadow-lg"
                        style={{
                          backgroundColor: planEditando.color || '#2563eb',
                          color: '#ffffff'
                        }}
                      >
                        Adquirir {planEditando.nombrePlan || 'Plan'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between bg-black/30">
                <p className="text-xs text-gray-500">
                  {planEditando.id ? 'Editando ID: ' + planEditando.id : 'Creando nuevo registro de membresía'}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPlan(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={guardarPlan}
                    disabled={guardando}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {guardando ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (REGLA RN-06) */}
      <AnimatePresence>
        {modalEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalEliminar(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-white mb-2">¿Eliminar o Desactivar Plan?</h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Vas a procesar el plan <span className="font-bold text-white">{modalEliminar.nombrePlan}</span>.
              </p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-6 text-xs text-amber-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Regla RN-06:</strong> Si el plan posee membresías activas o historial financiero, no podrá ser borrado físicamente para preservar la integridad de datos, sino que se desactivará automáticamente.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalEliminar(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminarPlan}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
