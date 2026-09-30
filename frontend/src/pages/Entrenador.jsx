import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Activity, Plus, Save, Search, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function Entrenador() {
  const [socios, setSocios] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(null); // 'RUTINA' o 'MEDICION' o null
  
  // Estado para Medición
  const [medicionForm, setMedicionForm] = useState({ peso: '', talla: '', porcentajeGrasa: '' });
  
  // Estado para Rutina
  const [rutinaForm, setRutinaForm] = useState({ nombre: '', descripcion: '', diaSemana: 'LUNES' });
  const [rutinaEjercicios, setRutinaEjercicios] = useState([{ idEjercicio: '', series: '4', repeticiones: '12' }]);
  
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [socRes, ejRes] = await Promise.all([
        api.get('/finanzas/socios').catch(() => ({ data: [] })),
        api.get('/entrenamiento/ejercicios').catch(() => ({ data: [] }))
      ]);
      setSocios(socRes.data);
      setEjercicios(ejRes.data);
    } catch (e) {
      console.error(e);
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
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const guardarMedicion = async (e) => {
    e.preventDefault();
    if (!socioSeleccionado) return;
    setGuardando(true);
    try {
      await api.post(`/entrenamiento/mediciones`, {
        idSocio: socioSeleccionado.id,
        peso: Number(medicionForm.peso),
        talla: Number(medicionForm.talla),
        porcentajeGrasa: medicionForm.porcentajeGrasa ? Number(medicionForm.porcentajeGrasa) : null
      });
      setModalAbierto(null);
      setMedicionForm({ peso: '', talla: '', porcentajeGrasa: '' });
      mostrarMensaje('Medición guardada con éxito.');
    } catch (e) {
      alert('Error guardando medición');
    } finally {
      setGuardando(false);
    }
  };

  const agregarEjercicio = () => {
    setRutinaEjercicios([...rutinaEjercicios, { idEjercicio: '', series: '4', repeticiones: '12' }]);
  };
  
  const actualizarEjercicio = (index, campo, valor) => {
    const nuevos = [...rutinaEjercicios];
    nuevos[index][campo] = valor;
    setRutinaEjercicios(nuevos);
  };

  const removerEjercicio = (index) => {
    const nuevos = [...rutinaEjercicios];
    nuevos.splice(index, 1);
    setRutinaEjercicios(nuevos);
  };

  const guardarRutina = async (e) => {
    e.preventDefault();
    if (!socioSeleccionado) return;
    
    // Filtrar los que no tienen idEjercicio
    const ejerciciosValidos = rutinaEjercicios.filter(ej => ej.idEjercicio);
    if (ejerciciosValidos.length === 0) {
      alert('Debes agregar al menos un ejercicio a la rutina.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        idSocio: socioSeleccionado.id,
        nombreRutina: rutinaForm.nombre || `Rutina ${rutinaForm.diaSemana}`,
        descripcion: rutinaForm.descripcion,
        diaSemana: rutinaForm.diaSemana,
        ejercicios: ejerciciosValidos.map(ej => ({
          idEjercicio: Number(ej.idEjercicio),
          series: Number(ej.series),
          repeticiones: Number(ej.repeticiones)
        }))
      };
      await api.post(`/entrenamiento/rutinas`, payload);
      setModalAbierto(null);
      setRutinaForm({ nombre: '', descripcion: '', diaSemana: 'LUNES' });
      setRutinaEjercicios([{ idEjercicio: '', series: '4', repeticiones: '12' }]);
      mostrarMensaje('Rutina asignada con éxito.');
    } catch (e) {
      alert('Error guardando rutina');
    } finally {
      setGuardando(false);
    }
  };

  const sociosFiltrados = socios.filter(s => {
    const term = busqueda.toLowerCase();
    return (s.nombres && s.nombres.toLowerCase().includes(term)) || 
           (s.apellidos && s.apellidos.toLowerCase().includes(term)) ||
           (s.dni && s.dni.includes(term));
  });

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#141414] border-r border-white/5 p-6 flex flex-col">
        <div className="text-2xl italic-heavy tracking-tighter mb-10">
          GYM<span className="text-orange-500">STAR</span>
        </div>
        
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Entrenador</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 text-sm font-bold">
            <Users className="w-5 h-5" /> Gestión de Socios
          </button>
        </div>

        <button 
          onClick={cerrarSesion}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold w-full"
        >
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-10 relative overflow-y-auto">
        <AnimatePresence>
          {mensajeExito && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 z-50 flex items-center gap-2 font-bold shadow-lg"
            >
              <CheckCircle className="w-5 h-5" /> {mensajeExito}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl italic-heavy uppercase tracking-tight mb-8">Socios Activos</h2>
          
          <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 mb-8 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por DNI o Nombre..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sociosFiltrados.map(socio => (
              <div key={socio.id} className="bg-[#141414] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
                  <span className="text-orange-500 font-black text-xl">{socio.nombres?.charAt(0) || 'S'}</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-bold text-lg">{socio.nombres} {socio.apellidos}</p>
                  <p className="text-gray-500 text-sm font-mono mb-4">DNI: {socio.dni || 'Sin DNI'}</p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <button 
                      onClick={() => { setSocioSeleccionado(socio); setModalAbierto('RUTINA'); }}
                      className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
                    >
                      <Plus className="w-3 h-3" /> Asignar Rutina
                    </button>
                    <button 
                      onClick={() => { setSocioSeleccionado(socio); setModalAbierto('MEDICION'); }}
                      className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
                    >
                      <Activity className="w-3 h-3" /> Medición
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {sociosFiltrados.length === 0 && (
              <div className="col-span-1 lg:col-span-2 text-center py-12 text-gray-500 bg-[#141414] border border-white/5 rounded-3xl">
                No se encontraron socios.
              </div>
            )}
          </div>
        </div>

        {/* MODAL RUTINA */}
        <AnimatePresence>
        {modalAbierto === 'RUTINA' && socioSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a] rounded-t-3xl">
                <div>
                  <h3 className="italic-heavy text-2xl">ASIGNAR RUTINA</h3>
                  <p className="text-orange-500 text-sm font-bold uppercase tracking-wider">{socioSeleccionado.nombres} {socioSeleccionado.apellidos}</p>
                </div>
                <button onClick={() => setModalAbierto(null)} className="text-gray-500 hover:text-white transition">Cerrar</button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre (Opcional)</label>
                    <input type="text" value={rutinaForm.nombre} onChange={e => setRutinaForm({...rutinaForm, nombre: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" placeholder="Ej. Tren Superior" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Día de Semana</label>
                    <select value={rutinaForm.diaSemana} onChange={e => setRutinaForm({...rutinaForm, diaSemana: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                      {['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descripción</label>
                  <input type="text" value={rutinaForm.descripcion} onChange={e => setRutinaForm({...rutinaForm, descripcion: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" placeholder="Ej. Enfocarse en hipertrofia" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Ejercicios</label>
                    <button type="button" onClick={agregarEjercicio} className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:text-orange-400"><Plus className="w-4 h-4" /> Agregar</button>
                  </div>
                  
                  <div className="space-y-3">
                    {rutinaEjercicios.map((ej, index) => (
                      <div key={index} className="flex gap-2 items-center bg-[#0a0a0a] p-2 rounded-xl border border-white/5">
                        <select 
                          value={ej.idEjercicio} 
                          onChange={e => actualizarEjercicio(index, 'idEjercicio', e.target.value)}
                          className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm"
                        >
                          <option value="" className="bg-[#0a0a0a] text-gray-500">Seleccionar Ejercicio...</option>
                          {ejercicios.map(e => <option key={e.id} value={e.id} className="bg-[#141414]">{e.nombreEjercicio} ({e.grupoMuscular})</option>)}
                        </select>
                        <input type="number" min="1" value={ej.series} onChange={e => actualizarEjercicio(index, 'series', e.target.value)} className="w-16 bg-[#141414] rounded-lg text-center p-2 text-sm focus:outline-none" placeholder="Ser." />
                        <span className="text-gray-500">x</span>
                        <input type="number" min="1" value={ej.repeticiones} onChange={e => actualizarEjercicio(index, 'repeticiones', e.target.value)} className="w-16 bg-[#141414] rounded-lg text-center p-2 text-sm focus:outline-none" placeholder="Rep." />
                        <button type="button" onClick={() => removerEjercicio(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/5 flex gap-3 bg-[#0a0a0a] rounded-b-3xl">
                <button onClick={() => setModalAbierto(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition">Cancelar</button>
                <button onClick={guardarRutina} disabled={guardando} className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-black uppercase transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Guardar Rutina
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* MODAL MEDICION */}
        <AnimatePresence>
        {modalAbierto === 'MEDICION' && socioSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-[#0a0a0a] rounded-t-3xl text-center relative">
                <button onClick={() => setModalAbierto(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition">✕</button>
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="italic-heavy text-2xl">NUEVA MEDICIÓN</h3>
                <p className="text-gray-400 text-sm">{socioSeleccionado.nombres} {socioSeleccionado.apellidos}</p>
              </div>
              
              <form onSubmit={guardarMedicion} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Peso (kg) - Obligatorio</label>
                  <input type="number" step="0.1" required value={medicionForm.peso} onChange={e => setMedicionForm({...medicionForm, peso: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-center text-xl font-bold" placeholder="Ej. 75.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Talla (m)</label>
                    <input type="number" step="0.01" required value={medicionForm.talla} onChange={e => setMedicionForm({...medicionForm, talla: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-center" placeholder="Ej. 1.75" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Grasa (%)</label>
                    <input type="number" step="0.1" value={medicionForm.porcentajeGrasa} onChange={e => setMedicionForm({...medicionForm, porcentajeGrasa: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-center" placeholder="Opcional" />
                  </div>
                </div>
                
                <button type="submit" disabled={guardando} className="w-full mt-4 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-black uppercase transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Registrar Medición
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
