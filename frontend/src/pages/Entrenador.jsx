import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, LogOut, Activity, Plus, Save, Search, CheckCircle, 
  Dumbbell, Eye, Edit3, X, ChevronRight, Award, Flame, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const PRESETS_RUTINA = [
  {
    nombre: 'Rutina Weider Dividida (Lunes a Sábado)',
    descripcion: 'Enfoque de hipertrofia muscular específica por grupo en 6 días',
    ejercicios: [
      { idEjercicio: 2, series: 4, repeticiones: 10, diaSemana: 'Lunes' },  // Press de Banca (Pecho)
      { idEjercicio: 11, series: 3, repeticiones: 12, diaSemana: 'Lunes' }, // Aperturas (Pecho)
      { idEjercicio: 4, series: 4, repeticiones: 8, diaSemana: 'Martes' },   // Dominadas (Espalda)
      { idEjercicio: 10, series: 4, repeticiones: 10, diaSemana: 'Martes' }, // Remo con Barra (Espalda)
      { idEjercicio: 1, series: 4, repeticiones: 10, diaSemana: 'Miércoles' },// Sentadilla (Piernas)
      { idEjercicio: 9, series: 4, repeticiones: 12, diaSemana: 'Miércoles' },// Prensa (Piernas)
      { idEjercicio: 5, series: 4, repeticiones: 10, diaSemana: 'Jueves' },  // Press Militar (Hombros)
      { idEjercicio: 8, series: 3, repeticiones: 15, diaSemana: 'Jueves' },  // Elevaciones Laterales (Hombros)
      { idEjercicio: 6, series: 4, repeticiones: 12, diaSemana: 'Viernes' }, // Curl de Bíceps (Brazos)
      { idEjercicio: 7, series: 4, repeticiones: 12, diaSemana: 'Viernes' }, // Extensión de Tríceps (Brazos)
      { idEjercicio: 3, series: 4, repeticiones: 8, diaSemana: 'Sábado' },   // Peso Muerto (Espalda/Piernas)
      { idEjercicio: 12, series: 3, repeticiones: 45, diaSemana: 'Sábado' }  // Plancha Abdominal (Core)
    ]
  },
  {
    nombre: 'Push / Pull / Legs (PPL x2 Semanal)',
    descripcion: 'Doble frecuencia de empuje, jalón y pierna de lunes a sábado',
    ejercicios: [
      { idEjercicio: 2, series: 4, repeticiones: 10, diaSemana: 'Lunes' },   // Press Banca
      { idEjercicio: 5, series: 3, repeticiones: 12, diaSemana: 'Lunes' },   // Press Militar
      { idEjercicio: 7, series: 3, repeticiones: 12, diaSemana: 'Lunes' },   // Tríceps
      { idEjercicio: 4, series: 4, repeticiones: 8, diaSemana: 'Martes' },   // Dominadas
      { idEjercicio: 10, series: 4, repeticiones: 10, diaSemana: 'Martes' }, // Remo Barra
      { idEjercicio: 6, series: 3, repeticiones: 12, diaSemana: 'Martes' },  // Bíceps
      { idEjercicio: 1, series: 4, repeticiones: 10, diaSemana: 'Miércoles' },// Sentadilla
      { idEjercicio: 9, series: 4, repeticiones: 12, diaSemana: 'Miércoles' },// Prensa
      { idEjercicio: 11, series: 4, repeticiones: 12, diaSemana: 'Jueves' },  // Aperturas
      { idEjercicio: 8, series: 4, repeticiones: 15, diaSemana: 'Jueves' },  // Elevaciones
      { idEjercicio: 3, series: 4, repeticiones: 8, diaSemana: 'Viernes' },  // Peso Muerto
      { idEjercicio: 13, series: 4, repeticiones: 12, diaSemana: 'Viernes' },// Curl Martillo
      { idEjercicio: 1, series: 3, repeticiones: 12, diaSemana: 'Sábado' },  // Sentadilla
      { idEjercicio: 12, series: 3, repeticiones: 45, diaSemana: 'Sábado' }  // Plancha
    ]
  },
  {
    nombre: 'Fuerza & Acondicionamiento Total (6 Días)',
    descripcion: 'Equilibrio de fuerza pesada, hipertrofia y resistencia aeróbica funcional',
    ejercicios: [
      { idEjercicio: 2, series: 4, repeticiones: 10, diaSemana: 'Lunes' },   // Press Banca
      { idEjercicio: 10, series: 4, repeticiones: 10, diaSemana: 'Lunes' },  // Remo Barra
      { idEjercicio: 1, series: 4, repeticiones: 10, diaSemana: 'Martes' },  // Sentadilla
      { idEjercicio: 9, series: 4, repeticiones: 12, diaSemana: 'Martes' },  // Prensa
      { idEjercicio: 5, series: 4, repeticiones: 10, diaSemana: 'Miércoles' },// Press Militar
      { idEjercicio: 6, series: 3, repeticiones: 12, diaSemana: 'Miércoles' },// Bíceps
      { idEjercicio: 7, series: 3, repeticiones: 12, diaSemana: 'Miércoles' },// Tríceps
      { idEjercicio: 11, series: 4, repeticiones: 12, diaSemana: 'Jueves' },  // Aperturas
      { idEjercicio: 4, series: 4, repeticiones: 8, diaSemana: 'Jueves' },   // Dominadas
      { idEjercicio: 3, series: 4, repeticiones: 8, diaSemana: 'Viernes' },  // Peso Muerto
      { idEjercicio: 12, series: 3, repeticiones: 45, diaSemana: 'Viernes' },// Plancha
      { idEjercicio: 1, series: 3, repeticiones: 12, diaSemana: 'Sábado' },  // Sentadilla
      { idEjercicio: 2, series: 3, repeticiones: 12, diaSemana: 'Sábado' }   // Press Banca
    ]
  }
];

const GRUPOS_MUSCULARES = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen'];

export default function Entrenador() {
  const [socios, setSocios] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [perfilEntrenador, setPerfilEntrenador] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRutina, setFiltroRutina] = useState('TODOS'); // 'TODOS' | 'CON_RUTINA' | 'SIN_RUTINA'
  const [cargando, setCargando] = useState(true);
  
  // Modales
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(null); // 'RUTINA' | 'MEDICION' | 'VER_RUTINA' | 'NUEVO_EJERCICIO'
  
  // Estado para Medición
  const [medicionForm, setMedicionForm] = useState({ peso: '', talla: '', porcentajeGrasa: '' });
  
  // Estado para Rutina Semanal (Lunes a Sábado)
  const [rutinaForm, setRutinaForm] = useState({ nombre: '', descripcion: '' });
  const [rutinaEjercicios, setRutinaEjercicios] = useState([]);
  const [diaAsignarActivo, setDiaAsignarActivo] = useState('Lunes');
  const [grupoFiltroSelector, setGrupoFiltroSelector] = useState('Todos');
  
  // Estado para Ver Rutina Actual
  const [rutinaActualCargando, setRutinaActualCargando] = useState(false);
  const [rutinaActualDetalle, setRutinaActualDetalle] = useState(null);
  const [diaVerActivo, setDiaVerActivo] = useState('TODOS');

  // Estado para Nuevo Ejercicio
  const [nuevoEjercicioForm, setNuevoEjercicioForm] = useState({ nombreEjercicio: '', descripcion: '', grupoMuscular: 'Pecho' });

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [socRes, ejRes, perfRes] = await Promise.all([
        api.get('/socios').catch(() => ({ data: [] })),
        api.get('/entrenamiento/ejercicios').catch(() => ({ data: [] })),
        api.get('/entrenamiento/perfil-entrenador').catch(() => ({ data: null }))
      ]);
      setSocios(socRes.data || []);
      setEjercicios(ejRes.data || []);
      if (perfRes.data && perfRes.data.idEntrenador) {
        setPerfilEntrenador(perfRes.data);
      }
    } catch (e) {
      console.error('Error al cargar datos del entrenador', e);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  const mostrarMensaje = (msg) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(''), 3500);
  };

  // Abrir modal de asignación de rutina semanal
  const abrirAsignarRutina = async (socio) => {
    setSocioSeleccionado(socio);
    setDiaAsignarActivo('Lunes');

    // Si el socio ya cuenta con una rutina activa, la precargamos con sus días
    try {
      const res = await api.get(`/entrenamiento/socio/${socio.id}/rutina-activa`);
      if (res.data && res.data.ejercicios && res.data.ejercicios.length > 0) {
        setRutinaForm({
          nombre: res.data.nombreRutina || `Rutina Semanal - ${socio.nombres}`,
          descripcion: res.data.descripcion || 'Plan de entrenamiento semanal de Lunes a Sábado.'
        });
        setRutinaEjercicios(res.data.ejercicios.map(e => ({
          idEjercicio: e.ejercicio?.id || e.idEjercicio || (ejercicios[0]?.id || ''),
          series: e.series || 4,
          repeticiones: e.repeticiones || 12,
          diaSemana: e.diaSemana || 'Lunes'
        })));
        setModalAbierto('RUTINA');
        return;
      }
    } catch (e) {
      // Si no tiene, cargamos la plantilla recomendada
    }

    setRutinaForm({
      nombre: `Rutina Semanal - ${socio.nombres}`,
      descripcion: 'Entrenamiento sectorizado de Lunes a Sábado con sobrecarga progresiva.'
    });
    // Precargar con el preset clásico
    aplicarPreset(PRESETS_RUTINA[0]);
    setModalAbierto('RUTINA');
  };

  // Cargar preset de rutina semanal
  const aplicarPreset = (preset) => {
    setRutinaForm({
      nombre: preset.nombre,
      descripcion: preset.descripcion
    });

    const ejsValidos = preset.ejercicios.filter(pEj => 
      ejercicios.some(e => e.id === pEj.idEjercicio)
    );

    if (ejsValidos.length > 0) {
      setRutinaEjercicios(ejsValidos.map(e => ({
        idEjercicio: e.idEjercicio,
        series: e.series,
        repeticiones: e.repeticiones,
        diaSemana: e.diaSemana || 'Lunes'
      })));
    }
  };

  // Ver la rutina activa de un socio (sectorizada)
  const abrirVerRutina = async (socio) => {
    setSocioSeleccionado(socio);
    setRutinaActualCargando(true);
    setDiaVerActivo('TODOS');
    setModalAbierto('VER_RUTINA');
    try {
      const res = await api.get(`/entrenamiento/socio/${socio.id}/rutina-activa`);
      if (res.data && res.data.id) {
        setRutinaActualDetalle(res.data);
      } else {
        setRutinaActualDetalle(null);
      }
    } catch (e) {
      setRutinaActualDetalle(null);
    } finally {
      setRutinaActualCargando(false);
    }
  };

  // Guardar la rutina asignada con días de Lunes a Sábado
  const guardarRutina = async (e) => {
    e.preventDefault();
    if (!socioSeleccionado) return;
    
    const ejerciciosValidos = rutinaEjercicios.filter(ej => ej.idEjercicio);
    if (ejerciciosValidos.length === 0) {
      alert('Debes asignar al menos 1 ejercicio a la rutina (RN-14).');
      return;
    }

    setGuardando(true);
    try {
      const idEnt = perfilEntrenador?.idEntrenador || 1;
      const payload = {
        idSocio: socioSeleccionado.id,
        idEntrenador: idEnt,
        nombreRutina: rutinaForm.nombre || `Rutina Semanal (Lunes a Sábado)`,
        ejercicios: ejerciciosValidos.map(ej => ({
          idEjercicio: Number(ej.idEjercicio),
          series: Number(ej.series) || 4,
          repeticiones: Number(ej.repeticiones) || 12,
          diaSemana: ej.diaSemana || 'Lunes'
        }))
      };

      await api.post(`/entrenamiento/rutinas`, payload);
      setModalAbierto(null);
      mostrarMensaje(`¡Rutina semanal asignada exitosamente a ${socioSeleccionado.nombres}!`);
      cargarDatos(); // Recargar socios para reflejar estado
    } catch (err) {
      alert('Error guardando la rutina: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };


  // Guardar medición antropométrica
  const guardarMedicion = async (e) => {
    e.preventDefault();
    if (!socioSeleccionado) return;
    setGuardando(true);
    try {
      const idEnt = perfilEntrenador?.idEntrenador || 1;
      await api.post(`/entrenamiento/mediciones`, {
        idSocio: socioSeleccionado.id,
        idEntrenador: idEnt,
        peso: Number(medicionForm.peso),
        talla: Number(medicionForm.talla),
        porcentajeGrasa: medicionForm.porcentajeGrasa ? Number(medicionForm.porcentajeGrasa) : 0
      });
      setModalAbierto(null);
      setMedicionForm({ peso: '', talla: '', porcentajeGrasa: '' });
      mostrarMensaje(`Medición registrada con éxito para ${socioSeleccionado.nombres}.`);
    } catch (err) {
      alert('Error guardando medición: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  // Crear nuevo ejercicio para el catálogo
  const guardarNuevoEjercicio = async (e) => {
    e.preventDefault();
    if (!nuevoEjercicioForm.nombreEjercicio.trim()) return;
    setGuardando(true);
    try {
      const res = await api.post('/entrenamiento/ejercicios', nuevoEjercicioForm);
      setEjercicios(prev => [...prev, res.data]);
      // Seleccionar automáticamente en la rutina
      setRutinaEjercicios(prev => [...prev, { idEjercicio: res.data.id, series: 4, repeticiones: 12 }]);
      setModalAbierto('RUTINA');
      setNuevoEjercicioForm({ nombreEjercicio: '', descripcion: '', grupoMuscular: 'Pecho' });
      mostrarMensaje(`Ejercicio "${res.data.nombreEjercicio}" añadido al catálogo.`);
    } catch (err) {
      alert('Error creando ejercicio: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  // Manipular ejercicios en formulario de rutina semanal
  const conteoPorDia = (dia) => {
    return rutinaEjercicios.filter(e => normalizarDia(e.diaSemana || 'Lunes') === normalizarDia(dia)).length;
  };

  const agregarEjercicioAlDia = (dia) => {
    const primerId = ejercicios.length > 0 ? ejercicios[0].id : '';
    setRutinaEjercicios(prev => [
      ...prev,
      { idEjercicio: primerId, series: 4, repeticiones: 12, diaSemana: dia }
    ]);
  };

  const agregarEjercicio = () => {
    agregarEjercicioAlDia(diaAsignarActivo);
  };

  const agregarEjercicioEspecifico = (idEj) => {
    setRutinaEjercicios(prev => [
      ...prev,
      { idEjercicio: idEj, series: 4, repeticiones: 12, diaSemana: diaAsignarActivo }
    ]);
  };
  
  const actualizarEjercicio = (index, campo, valor) => {
    const nuevos = [...rutinaEjercicios];
    if (nuevos[index]) {
      nuevos[index][campo] = valor;
      setRutinaEjercicios(nuevos);
    }
  };

  const removerEjercicio = (index) => {
    const nuevos = [...rutinaEjercicios];
    nuevos.splice(index, 1);
    setRutinaEjercicios(nuevos);
  };

  // Filtrado de socios
  const sociosFiltrados = socios.filter(s => {
    const term = busqueda.toLowerCase();
    const matchTerm = (s.nombres && s.nombres.toLowerCase().includes(term)) || 
                      (s.apellidos && s.apellidos.toLowerCase().includes(term)) ||
                      (s.dni && s.dni.includes(term));
    if (!matchTerm) return false;
    if (filtroRutina === 'CON_RUTINA') return s.tieneRutina;
    if (filtroRutina === 'SIN_RUTINA') return !s.tieneRutina;
    return true;
  });

  // Estadísticas rápidas
  const totalSocios = socios.length;
  const conRutinaCount = socios.filter(s => s.tieneRutina).length;
  const sinRutinaCount = totalSocios - conRutinaCount;

  // Cálculo IMC
  const imcCalculado = (peso, talla) => {
    if (!peso || !talla || talla <= 0) return null;
    const imc = peso / (talla * talla);
    let estado = 'Normal';
    if (imc < 18.5) estado = 'Bajo peso';
    else if (imc >= 25 && imc < 30) estado = 'Sobrepeso';
    else if (imc >= 30) estado = 'Obesidad';
    return { valor: imc.toFixed(1), estado };
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando Módulo de Entrenamiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans flex flex-col md:flex-row selection:bg-blue-600/30">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-[#0c0c0c] border-r border-white/5 p-6 flex flex-col">
        <div className="text-2xl font-black tracking-tighter mb-8">
          GYM<span className="text-blue-600">STAR</span>
        </div>
        
        {/* Tarjeta Entrenador */}
        <div className="bg-gradient-to-br from-blue-900/30 via-[#111] to-[#0c0c0c] border border-blue-500/20 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30">
              {perfilEntrenador?.nombres ? perfilEntrenador.nombres.charAt(0) : 'E'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">
                {perfilEntrenador?.nombres || 'Entrenador'} {perfilEntrenador?.apellidos || ''}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Award className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider truncate">
                  {perfilEntrenador?.especialidad || 'Instructor Principal'}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/5 flex justify-between text-[11px] text-gray-400 font-mono">
            <span>DNI: {perfilEntrenador?.dni || '71234567'}</span>
            <span className="text-green-400 font-bold">Activo</span>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex-1 space-y-2">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Módulos</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 text-sm font-bold text-left">
            <Dumbbell className="w-4 h-4" /> Asignación de Rutinas
          </button>
          <button 
            onClick={() => setModalAbierto('NUEVO_EJERCICIO')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold text-left"
          >
            <Plus className="w-4 h-4 text-blue-500" /> Nuevo Ejercicio
          </button>
        </div>

        <button 
          onClick={cerrarSesion}
          className="mt-6 flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold w-full"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 lg:p-10 relative overflow-y-auto">
        <AnimatePresence>
          {mensajeExito && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl bg-green-500/20 border border-green-500/50 text-green-400 z-50 flex items-center gap-3 font-bold shadow-2xl backdrop-blur-md text-sm"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>{mensajeExito}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase">
                Panel de <span className="text-blue-600">Entrenamiento</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Asigna rutinas personalizadas, consulta ejercicios y monitorea el progreso de los clientes.
              </p>
            </div>
            
            <button 
              onClick={() => setModalAbierto('NUEVO_EJERCICIO')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-blue-500" /> Crear Ejercicio
            </button>
          </div>

          {/* Estadísticas de Rutinas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Clientes</p>
                <p className="text-3xl font-black text-white">{totalSocios}</p>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-green-500/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-1">Con Rutina Activa</p>
                <p className="text-3xl font-black text-green-400">{conRutinaCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Pendientes de Rutina</p>
                <p className="text-3xl font-black text-amber-400">{sinRutinaCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Barra de Filtro y Búsqueda */}
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por DNI o Nombres (ej. Marc Berrocal)..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Chips de filtro */}
            <div className="flex gap-2 w-full md:w-auto">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'CON_RUTINA', label: 'Con Rutina' },
                { id: 'SIN_RUTINA', label: 'Sin Rutina' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroRutina(f.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-1 md:flex-none ${
                    filtroRutina === f.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Socios / Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {sociosFiltrados.map(socio => (
              <div 
                key={socio.id} 
                className="bg-[#0f0f0f] border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-blue-600/10 border border-white/10 group-hover:border-blue-500/30 flex items-center justify-center flex-shrink-0 transition-colors">
                        <span className="text-white font-black text-xl group-hover:text-blue-400">
                          {socio.nombres?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                          {socio.nombres} {socio.apellidos}
                        </h3>
                        <p className="text-gray-400 text-xs font-mono">
                          DNI: <span className="text-white font-bold">{socio.dni || 'Sin DNI'}</span>
                          {socio.telefono && <span className="ml-3 text-gray-500">Tel: {socio.telefono}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Badge de Membresía */}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                      socio.estadoMembresia === 'ACTIVA' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : socio.estadoMembresia === 'MOROSO'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {socio.estadoMembresia || 'SIN MEMBRESÍA'}
                    </span>
                  </div>

                  {/* Estado de Rutina del Socio */}
                  <div className="bg-[#080808] border border-white/5 rounded-xl p-3.5 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${socio.tieneRutina ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}></div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {socio.tieneRutina ? socio.rutinaNombre : 'Sin rutina activa asignada'}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {socio.tieneRutina ? 'Rutina Vigente' : 'Requiere plan de entrenamiento'}
                        </p>
                      </div>
                    </div>

                    {socio.tieneRutina && (
                      <button 
                        onClick={() => abrirVerRutina(socio)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 flex-shrink-0 ml-2"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                    )}
                  </div>
                </div>

                {/* Acciones para el socio */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {socio.tieneRutina && (
                    <button 
                      onClick={() => abrirVerRutina(socio)}
                      className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver Rutina
                    </button>
                  )}

                  <button 
                    onClick={() => abrirAsignarRutina(socio)}
                    className={`flex-1 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                      socio.tieneRutina 
                        ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    }`}
                  >
                    {socio.tieneRutina ? <Edit3 className="w-3.5 h-3.5 text-blue-400" /> : <Plus className="w-3.5 h-3.5" />}
                    {socio.tieneRutina ? 'Modificar' : 'Asignar Rutina'}
                  </button>

                  <button 
                    onClick={() => { setSocioSeleccionado(socio); setModalAbierto('MEDICION'); }}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-white/10"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-400" /> Medir
                  </button>
                </div>
              </div>
            ))}

            {sociosFiltrados.length === 0 && (
              <div className="col-span-1 lg:col-span-2 text-center py-16 text-gray-500 bg-[#0f0f0f] border border-white/5 rounded-3xl">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20 text-blue-500" />
                <p className="font-bold text-lg text-white mb-1">No se encontraron clientes</p>
                <p className="text-sm">Intenta con otro término de búsqueda o cambia el filtro de rutinas.</p>
              </div>
            )}
          </div>
        </div>

        {/* MODAL 1: ASIGNAR / CONFIGURAR RUTINA */}
        <AnimatePresence>
        {modalAbierto === 'RUTINA' && socioSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Módulo Entrenador</span>
                  <h3 className="font-black tracking-tighter text-2xl text-white">ASIGNAR RUTINA</h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Cliente: <strong className="text-white">{socioSeleccionado.nombres} {socioSeleccionado.apellidos}</strong> (DNI: {socioSeleccionado.dni || 'S/D'})
                  </p>
                </div>
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Plantillas / Presets rápidos */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                    Plantillas Rápidas Predefinidas
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESETS_RUTINA.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => aplicarPreset(p)}
                        className="bg-[#0a0a0a] hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 p-2.5 rounded-xl text-left transition-all group"
                      >
                        <p className="text-xs font-bold text-white group-hover:text-blue-400 leading-tight mb-1">{p.nombre}</p>
                        <p className="text-[10px] text-gray-500 truncate">{p.ejercicios.length} ejercicios</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre de la Rutina</label>
                    <input 
                      type="text" 
                      required
                      value={rutinaForm.nombre} 
                      onChange={e => setRutinaForm({...rutinaForm, nombre: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm font-medium" 
                      placeholder="Ej. Plan Semanal Hipertrofia (Lunes a Sábado)" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Instrucciones / Observaciones</label>
                    <input 
                      type="text" 
                      value={rutinaForm.descripcion} 
                      onChange={e => setRutinaForm({...rutinaForm, descripcion: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm font-medium" 
                      placeholder="Ej. Descanso de 60-90 segundos entre series. Técnica estricta." 
                    />
                  </div>
                </div>

                {/* Selector de Días de Lunes a Sábado */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Distribución Semanal por Días (Lunes a Sábado)
                    </label>
                    <span className="text-[11px] font-mono text-blue-400 font-bold">
                      {rutinaEjercicios.length} ejercicios en total
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DIAS_SEMANA.map((dia) => {
                      const count = conteoPorDia(dia);
                      const isActivo = normalizarDia(diaAsignarActivo) === normalizarDia(dia);
                      return (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => setDiaAsignarActivo(dia)}
                          className={`relative p-3 rounded-2xl border text-center transition-all ${
                            isActivo
                              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 text-white font-black'
                              : 'bg-[#0a0a0a] hover:bg-white/5 border-white/5 text-gray-400 hover:text-white font-medium'
                          }`}
                        >
                          <p className="text-xs uppercase tracking-wider mb-1 font-bold">{dia}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            count > 0 
                              ? (isActivo ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400')
                              : 'bg-white/5 text-gray-500'
                          }`}>
                            {count > 0 ? `${count} ej.` : 'Descanso'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Constructor de Ejercicios del Día Activo */}
                {(() => {
                  const ejerciciosDelDia = rutinaEjercicios
                    .map((ej, indexGlobal) => ({ ...ej, indexGlobal }))
                    .filter(ej => normalizarDia(ej.diaSemana || 'Lunes') === normalizarDia(diaAsignarActivo));

                  return (
                    <div className="bg-[#0a0a0a] p-4 sm:p-5 rounded-2xl border border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                              Ejercicios del día {diaAsignarActivo}
                            </h4>
                            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold">
                              {ejerciciosDelDia.length} asignados
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Configura los ejercicios asignados a este día o déjalo sin ejercicios para descanso.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={() => setModalAbierto('NUEVO_EJERCICIO')}
                            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition"
                          >
                            + Catálogo
                          </button>
                          <button 
                            type="button" 
                            onClick={() => agregarEjercicioAlDia(diaAsignarActivo)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-md shadow-blue-600/20"
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar Ejercicio al {diaAsignarActivo}
                          </button>
                        </div>
                      </div>

                      {ejerciciosDelDia.length === 0 ? (
                        <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                          <p className="text-sm font-bold text-gray-400 mb-1">
                            Día de Descanso / Recuperación Activa ({diaAsignarActivo})
                          </p>
                          <p className="text-xs text-gray-600 mb-3">
                            No hay ejercicios asignados. El cliente tendrá este día libre o de recuperación.
                          </p>
                          <button
                            type="button"
                            onClick={() => agregarEjercicioAlDia(diaAsignarActivo)}
                            className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
                          >
                            + Asignar ejercicios para el {diaAsignarActivo}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {ejerciciosDelDia.map((ej, numIdx) => {
                            const ejercicioInfo = ejercicios.find(e => e.id === Number(ej.idEjercicio));
                            return (
                              <div key={ej.indexGlobal} className="bg-[#050505] p-3.5 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <span className="text-gray-500 font-mono text-xs w-6 font-bold">{numIdx + 1}.</span>
                                
                                {/* Selector de ejercicio */}
                                <div className="flex-1 w-full min-w-0">
                                  <select 
                                    value={ej.idEjercicio} 
                                    onChange={e => actualizarEjercicio(ej.indexGlobal, 'idEjercicio', e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-600 text-sm font-medium"
                                  >
                                    <option value="">Seleccionar Ejercicio...</option>
                                    {ejercicios.map(e => (
                                      <option key={e.id} value={e.id} className="bg-[#111]">
                                        {e.nombreEjercicio} ({e.grupoMuscular})
                                      </option>
                                    ))}
                                  </select>
                                  {ejercicioInfo?.descripcion && (
                                    <p className="text-[11px] text-gray-500 mt-1 pl-1 line-clamp-1 italic">
                                      {ejercicioInfo.descripcion}
                                    </p>
                                  )}
                                </div>

                                {/* Selector de día (para moverlo si se desea) */}
                                <div className="flex items-center gap-1.5 bg-[#111] border border-white/10 rounded-xl px-2 py-1 flex-shrink-0">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold">Día:</span>
                                  <select
                                    value={ej.diaSemana || diaAsignarActivo}
                                    onChange={e => actualizarEjercicio(ej.indexGlobal, 'diaSemana', e.target.value)}
                                    className="bg-transparent text-xs text-white font-bold focus:outline-none py-1 pr-1"
                                  >
                                    {DIAS_SEMANA.map(d => (
                                      <option key={d} value={d} className="bg-[#111]">{d}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Sets y Reps */}
                                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                  <div className="flex items-center bg-[#111] border border-white/10 rounded-xl px-2">
                                    <span className="text-[11px] text-gray-500 uppercase font-bold mr-1.5">Sets:</span>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      max="20"
                                      value={ej.series} 
                                      onChange={e => actualizarEjercicio(ej.indexGlobal, 'series', e.target.value)} 
                                      className="w-12 bg-transparent text-center py-2 text-sm text-white font-bold focus:outline-none" 
                                    />
                                  </div>

                                  <span className="text-gray-600">x</span>

                                  <div className="flex items-center bg-[#111] border border-white/10 rounded-xl px-2">
                                    <span className="text-[11px] text-gray-500 uppercase font-bold mr-1.5">Reps:</span>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      max="100"
                                      value={ej.repeticiones} 
                                      onChange={e => actualizarEjercicio(ej.indexGlobal, 'repeticiones', e.target.value)} 
                                      className="w-12 bg-transparent text-center py-2 text-sm text-blue-400 font-bold focus:outline-none" 
                                    />
                                  </div>

                                  <button 
                                    type="button" 
                                    onClick={() => removerEjercicio(ej.indexGlobal)} 
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition"
                                    title="Remover ejercicio"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              {/* Footer Modal */}
              <div className="p-6 border-t border-white/5 flex gap-3 bg-[#0a0a0a]">
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition text-sm text-gray-300"
                >
                  Cancelar
                </button>
                <button 
                  onClick={guardarRutina} 
                  disabled={guardando} 
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/30"
                >
                  <Save className="w-4 h-4" /> {guardando ? 'Guardando...' : 'Guardar y Asignar Rutina'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* MODAL 2: VER RUTINA ACTUAL (SECTORIZADA POR DÍAS LUNES A SÁBADO) */}
        <AnimatePresence>
        {modalAbierto === 'VER_RUTINA' && socioSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                      Rutina Semanal Vigente
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      Lunes a Sábado
                    </span>
                  </div>
                  <h3 className="font-black text-2xl text-white tracking-tight">
                    {rutinaActualDetalle?.nombreRutina || rutinaActualDetalle?.nombre || 'Rutina Activa'}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Cliente: <strong className="text-white">{socioSeleccionado.nombres} {socioSeleccionado.apellidos}</strong> (DNI: {socioSeleccionado.dni || 'S/D'})
                  </p>
                </div>
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Barra de Filtro de Días */}
              <div className="p-3 bg-[#0a0a0a] border-b border-white/5 overflow-x-auto">
                <div className="flex gap-1.5 min-w-max">
                  <button
                    onClick={() => setDiaVerActivo('TODOS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      diaVerActivo === 'TODOS'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    Todos los Días ({(rutinaActualDetalle?.ejercicios || []).length})
                  </button>
                  {DIAS_SEMANA.map(dia => {
                    const count = (rutinaActualDetalle?.ejercicios || []).filter(
                      e => normalizarDia(e.diaSemana || 'Lunes') === normalizarDia(dia)
                    ).length;
                    const isActivo = diaVerActivo === dia;
                    return (
                      <button
                        key={dia}
                        onClick={() => setDiaVerActivo(dia)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isActivo
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{dia}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          count > 0 ? (isActivo ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400') : 'bg-white/5 text-gray-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {rutinaActualCargando ? (
                  <div className="py-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs uppercase tracking-wider">Cargando ejercicios...</p>
                  </div>
                ) : rutinaActualDetalle && rutinaActualDetalle.ejercicios && rutinaActualDetalle.ejercicios.length > 0 ? (
                  <div className="space-y-6">
                    {(diaVerActivo === 'TODOS' ? DIAS_SEMANA : [diaVerActivo]).map(dia => {
                      const ejsDia = rutinaActualDetalle.ejercicios.filter(
                        e => normalizarDia(e.diaSemana || 'Lunes') === normalizarDia(dia)
                      );

                      // Grupos musculares únicos en este día
                      const gruposDia = Array.from(new Set(
                        ejsDia.map(e => e.ejercicio?.grupoMuscular || e.grupoMuscular || 'General')
                      ));

                      return (
                        <div key={dia} className="bg-[#070707] border border-white/5 rounded-2xl p-4">
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                              <h4 className="font-black text-white text-base tracking-wide uppercase">{dia}</h4>
                              {gruposDia.length > 0 && (
                                <span className="text-[11px] text-gray-400 font-medium">
                                  ({gruposDia.join(' • ')})
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              ejsDia.length > 0 ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-gray-500'
                            }`}>
                              {ejsDia.length > 0 ? `${ejsDia.length} ejercicios` : 'Descanso'}
                            </span>
                          </div>

                          {ejsDia.length > 0 ? (
                            <div className="space-y-2.5">
                              {ejsDia.map((ej, idx) => {
                                const nom = ej.ejercicio?.nombreEjercicio || ej.nombreEjercicio || ej.nombre || 'Ejercicio';
                                const desc = ej.ejercicio?.descripcion || ej.descripcion || 'Sin descripción detallada';
                                const grupo = ej.ejercicio?.grupoMuscular || ej.grupoMuscular || 'General';
                                return (
                                  <div key={idx} className="bg-[#0f0f0f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-4 hover:border-white/10 transition">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-gray-500 font-bold">{idx + 1}.</span>
                                        <h5 className="font-bold text-white text-sm truncate">{nom}</h5>
                                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                                          {grupo}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-gray-400 line-clamp-1 pl-4">
                                        {desc}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0 pl-4 border-l border-white/5">
                                      <p className="text-base font-black text-white">{ej.series} <span className="text-[10px] text-gray-500 uppercase">sets</span></p>
                                      <p className="text-base font-black text-blue-400">{ej.repeticiones} <span className="text-[10px] text-gray-500 uppercase">reps</span></p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-gray-500 text-xs">
                              🌙 Día de Descanso / Recuperación Activa programado para este día.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="font-bold text-white">No se pudo cargar la rutina o está vacía</p>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-white/5 flex gap-3 bg-[#0a0a0a]">
                <button 
                  onClick={() => { setModalAbierto(null); abrirAsignarRutina(socioSeleccionado); }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Modificar Rutina
                </button>
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* MODAL 3: MEDICIÓN BIOMÉTRICA */}
        <AnimatePresence>
        {modalAbierto === 'MEDICION' && socioSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-[#0a0a0a] text-center relative">
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-black tracking-tighter text-2xl text-white">NUEVA MEDICIÓN</h3>
                <p className="text-gray-400 text-xs mt-1">
                  Cliente: <strong className="text-white">{socioSeleccionado.nombres} {socioSeleccionado.apellidos}</strong>
                </p>
              </div>
              
              <form onSubmit={guardarMedicion} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Peso (kg) - Obligatorio
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="20"
                    max="300"
                    required 
                    value={medicionForm.peso} 
                    onChange={e => setMedicionForm({...medicionForm, peso: e.target.value})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-center text-2xl font-black" 
                    placeholder="75.5" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Talla (m)
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.5"
                      max="2.5"
                      required 
                      value={medicionForm.talla} 
                      onChange={e => setMedicionForm({...medicionForm, talla: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-center font-bold" 
                      placeholder="1.75" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      % Grasa (Opcional)
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      max="70"
                      value={medicionForm.porcentajeGrasa} 
                      onChange={e => setMedicionForm({...medicionForm, porcentajeGrasa: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-center font-bold" 
                      placeholder="18.5" 
                    />
                  </div>
                </div>

                {/* Vista previa de IMC */}
                {(() => {
                  const imc = imcCalculado(medicionForm.peso, medicionForm.talla);
                  if (!imc) return null;
                  return (
                    <div className="bg-[#050505] border border-blue-500/20 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">IMC Estimado</p>
                      <p className="text-xl font-black text-blue-400">{imc.valor} <span className="text-xs font-normal text-gray-300">({imc.estado})</span></p>
                    </div>
                  );
                })()}
                
                <button 
                  type="submit" 
                  disabled={guardando} 
                  className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-sm"
                >
                  <Save className="w-4 h-4" /> {guardando ? 'Guardando...' : 'Registrar Medición'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* MODAL 4: CREAR NUEVO EJERCICIO */}
        <AnimatePresence>
        {modalAbierto === 'NUEVO_EJERCICIO' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex justify-between items-center">
                <div>
                  <h3 className="font-black text-xl text-white">NUEVO EJERCICIO</h3>
                  <p className="text-gray-400 text-xs">Añadir al catálogo de entrenamiento</p>
                </div>
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={guardarNuevoEjercicio} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Nombre del Ejercicio
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={nuevoEjercicioForm.nombreEjercicio} 
                    onChange={e => setNuevoEjercicioForm({...nuevoEjercicioForm, nombreEjercicio: e.target.value})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm" 
                    placeholder="Ej. Hip Thrust con Barra" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Grupo Muscular
                  </label>
                  <select 
                    value={nuevoEjercicioForm.grupoMuscular} 
                    onChange={e => setNuevoEjercicioForm({...nuevoEjercicioForm, grupoMuscular: e.target.value})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm font-medium"
                  >
                    {GRUPOS_MUSCULARES.filter(g => g !== 'Todos').map(g => (
                      <option key={g} value={g} className="bg-[#111]">{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Descripción / Técnica
                  </label>
                  <textarea 
                    rows="3"
                    value={nuevoEjercicioForm.descripcion} 
                    onChange={e => setNuevoEjercicioForm({...nuevoEjercicioForm, descripcion: e.target.value})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm resize-none" 
                    placeholder="Explicación de la postura, respiración y ejecución..." 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={guardando} 
                  className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50 text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {guardando ? 'Guardando...' : 'Registrar en Catálogo'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

      </main>
    </div>
  );
}
