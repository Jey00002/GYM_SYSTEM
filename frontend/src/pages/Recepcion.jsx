import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, ScanLine, LogOut, CheckCircle, Trash2, 
  AlertTriangle, Fingerprint, Plus, Edit2, CreditCard, X, 
  Calendar, Phone, Mail, User, ShieldCheck, DollarSign
} from 'lucide-react';
import api from '../services/api';

export default function Recepcion() {
  const [aforo, setAforo] = useState({ actual: 0, maximo: 100 });
  const [busqueda, setBusqueda] = useState('');
  const [socios, setSocios] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'ACTIVA' | 'VENCIDA' | 'SIN_MEMBRESIA'
  const [cargando, setCargando] = useState(false);
  const [resultadoAcceso, setResultadoAcceso] = useState(null); // { tipo: 'AUTORIZADO' | 'DENEGADO', mensaje: '' }

  // Modales
  const [modalAbierto, setModalAbierto] = useState(null); // 'NUEVO' | 'EDITAR' | 'PAGO' | 'ELIMINAR'
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);

  // Formulario Socio (Nuevo / Editar)
  const [formSocio, setFormSocio] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    fechaNacimiento: '',
    activarPlan: false,
    idPlan: '',
    idMetodoPago: 1 // 1: Efectivo, 2: Tarjeta, 3: Transferencia
  });
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Formulario Pago / Membresía
  const [formPago, setFormPago] = useState({
    idPlan: '',
    idMetodoPago: 1
  });

  const navigate = useNavigate();

  useEffect(() => {
    cargarAforo();
    cargarSocios();
    cargarPlanes();
    const interval = setInterval(cargarAforo, 25000);
    return () => clearInterval(interval);
  }, []);

  const cargarAforo = async () => {
    try {
      const res = await api.get('/accesos/aforo');
      setAforo(res.data);
    } catch (e) {
      console.error('Error al cargar aforo');
    }
  };

  const cargarSocios = async () => {
    setCargando(true);
    try {
      const res = await api.get('/socios');
      setSocios(res.data || []);
    } catch (e) {
      console.error('Error al cargar socios', e);
    } finally {
      setCargando(false);
    }
  };

  const cargarPlanes = async () => {
    try {
      const res = await api.get('/planes');
      setPlanes(res.data || []);
    } catch (e) {
      console.error('Error al cargar planes', e);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  const mostrarMensaje = (tipo, mensaje) => {
    setResultadoAcceso({ tipo, mensaje });
    setTimeout(() => setResultadoAcceso(null), 3500);
  };

  // Registrar acceso físico (QR o DNI)
  const registrarAcceso = async (idSocio) => {
    try {
      const res = await api.post('/accesos', { idSocio, metodo: 'QR' });
      mostrarMensaje(
        res.data.resultado || 'AUTORIZADO',
        res.data.mensaje || 'Acceso registrado correctamente'
      );
      cargarAforo();
    } catch (e) {
      mostrarMensaje('DENEGADO', e.response?.data?.message || 'Error al procesar el acceso del socio');
    }
  };

  // Consultar DNI en RENIEC
  const consultarDni = async () => {
    if (!formSocio.dni || formSocio.dni.length !== 8) {
      alert('Ingresa un número de DNI válido de 8 dígitos');
      return;
    }
    setBuscandoDni(true);
    try {
      const res = await api.get(`/dni/${formSocio.dni}`);
      if (res.data) {
        setFormSocio(prev => ({
          ...prev,
          nombres: res.data.nombres || prev.nombres,
          apellidos: `${res.data.apellidoPaterno || ''} ${res.data.apellidoMaterno || ''}`.trim() || prev.apellidos,
          correo: prev.correo || `${res.data.nombres?.toLowerCase().replace(/\s+/g, '') || 'socio'}.${res.data.apellidoPaterno?.toLowerCase() || 'gym'}@gym.com`
        }));
      }
    } catch (e) {
      alert('No se pudo autocompletar con el DNI. Puedes ingresar los datos manualmente.');
    } finally {
      setBuscandoDni(false);
    }
  };

  // Abrir modal Nuevo Socio
  const abrirModalNuevo = () => {
    setFormSocio({
      dni: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      fechaNacimiento: '',
      activarPlan: false,
      idPlan: planes.length > 0 ? planes[0].id : '',
      idMetodoPago: 1
    });
    setModalAbierto('NUEVO');
  };

  // Abrir modal Editar Socio
  const abrirModalEditar = (socio) => {
    setSocioSeleccionado(socio);
    setFormSocio({
      dni: socio.dni || '',
      nombres: socio.nombres || '',
      apellidos: socio.apellidos || '',
      correo: socio.correo || socio.usuario?.correo || '',
      telefono: socio.telefono || '',
      fechaNacimiento: socio.fechaNacimiento || '',
      activarPlan: false,
      idPlan: '',
      idMetodoPago: 1
    });
    setModalAbierto('EDITAR');
  };

  // Guardar nuevo cliente
  const submitNuevoSocio = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        dni: formSocio.dni.trim(),
        nombres: formSocio.nombres.trim(),
        apellidos: formSocio.apellidos.trim(),
        correo: formSocio.correo.trim(),
        telefono: formSocio.telefono.trim(),
        fechaNacimiento: formSocio.fechaNacimiento || null
      };

      const res = await api.post('/socios', payload);
      const nuevoId = res.data.id;

      // Si seleccionó activar membresía inicial inmediatamente
      if (formSocio.activarPlan && formSocio.idPlan) {
        try {
          await api.post('/pagos/confirmar', {
            idSocio: nuevoId,
            idPlan: formSocio.idPlan,
            idMetodoPago: formSocio.idMetodoPago
          });
        } catch (errPago) {
          console.warn('Socio creado pero falló la membresía inicial', errPago);
        }
      }

      setModalAbierto(null);
      mostrarMensaje('AUTORIZADO', `Cliente ${formSocio.nombres} registrado con éxito`);
      cargarSocios();
    } catch (err) {
      alert('Error al registrar socio: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  // Actualizar datos del cliente
  const submitEditarSocio = async (e) => {
    e.preventDefault();
    if (!socioSeleccionado) return;
    setGuardando(true);
    try {
      const payload = {
        dni: formSocio.dni.trim(),
        nombres: formSocio.nombres.trim(),
        apellidos: formSocio.apellidos.trim(),
        correo: formSocio.correo.trim(),
        telefono: formSocio.telefono.trim(),
        fechaNacimiento: formSocio.fechaNacimiento || null
      };

      await api.put(`/socios/${socioSeleccionado.id}`, payload);
      setModalAbierto(null);
      mostrarMensaje('AUTORIZADO', `Datos de ${formSocio.nombres} actualizados exitosamente`);
      cargarSocios();
    } catch (err) {
      alert('Error al editar socio: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de Membresía / Pago
  const abrirModalPago = (socio) => {
    setSocioSeleccionado(socio);
    setFormPago({
      idPlan: planes.length > 0 ? planes[0].id : '',
      idMetodoPago: 1
    });
    setModalAbierto('PAGO');
  };

  // Confirmar pago y activar plan
  const submitPago = async (e) => {
    e.preventDefault();
    if (!socioSeleccionado || !formPago.idPlan) return;
    setGuardando(true);
    try {
      await api.post('/pagos/confirmar', {
        idSocio: socioSeleccionado.id,
        idPlan: formPago.idPlan,
        idMetodoPago: formPago.idMetodoPago
      });
      setModalAbierto(null);
      mostrarMensaje('AUTORIZADO', `Membresía activada exitosamente para ${socioSeleccionado.nombres}`);
      cargarSocios();
    } catch (err) {
      alert('Error activando membresía: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar socio
  const ejecutarEliminar = async () => {
    if (!socioSeleccionado) return;
    setGuardando(true);
    try {
      await api.delete(`/socios/${socioSeleccionado.id}`);
      setModalAbierto(null);
      mostrarMensaje('AUTORIZADO', `Cliente ${socioSeleccionado.nombres} eliminado correctamente`);
      cargarSocios();
    } catch (err) {
      alert('Error al eliminar cliente: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado de socios
  const sociosFiltrados = socios.filter(s => {
    const term = busqueda.toLowerCase();
    const matchTerm = !busqueda.trim() || 
      (s.dni && s.dni.includes(term)) || 
      (s.nombres && s.nombres.toLowerCase().includes(term)) ||
      (s.apellidos && s.apellidos.toLowerCase().includes(term)) ||
      (s.correo && s.correo.toLowerCase().includes(term));
    if (!matchTerm) return false;

    if (filtroEstado === 'ACTIVA') return s.estadoMembresia === 'ACTIVA';
    if (filtroEstado === 'VENCIDA') return s.estadoMembresia === 'VENCIDA' || s.estadoMembresia === 'MOROSO';
    if (filtroEstado === 'SIN_MEMBRESIA') return !s.estadoMembresia || s.estadoMembresia === 'SIN_MEMBRESIA';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#060606] text-white font-sans flex flex-col md:flex-row selection:bg-blue-600/30">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-[#0b0b0b] border-r border-white/5 p-6 flex flex-col relative overflow-hidden">
        <div className="text-3xl font-black tracking-tighter mb-8 relative z-10">
          GYM<span className="text-blue-600">STAR</span>
        </div>
        
        {/* Widget Aforo */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 text-center mb-6 shadow-2xl relative overflow-hidden">
          <Fingerprint className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Aforo Actual</p>
          <p className="text-4xl font-black text-white">{aforo.actual}</p>
          <div className="w-full bg-black/60 h-2 rounded-full mt-3 overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((aforo.actual / aforo.maximo) * 100, 100)}%` }}
              className={`h-full rounded-full ${aforo.actual >= aforo.maximo * 0.9 ? 'bg-red-500' : 'bg-blue-600'}`}
            />
          </div>
          <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase">Capacidad Máx: {aforo.maximo}</p>
        </div>

        {/* Accesos rápidos */}
        <div className="flex-1 space-y-2">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Recepción</p>
          <button 
            onClick={abrirModalNuevo}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-xs font-bold uppercase tracking-wider transition"
          >
            <Plus className="w-4 h-4" /> Registrar Cliente
          </button>
        </div>

        <button 
          onClick={cerrarSesion}
          className="mt-6 flex items-center justify-center gap-2.5 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition text-xs font-bold uppercase tracking-wider w-full border border-white/5"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 lg:p-10 relative overflow-y-auto">
        
        {/* Banner Notificación */}
        <AnimatePresence>
          {resultadoAcceso && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-md font-bold text-sm ${
                resultadoAcceso.tipo === 'AUTORIZADO' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}
            >
              {resultadoAcceso.tipo === 'AUTORIZADO' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              <span>{resultadoAcceso.mensaje}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase">
                Control de <span className="text-blue-600">Recepción</span>
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Administra los clientes, controla sus accesos y renueva membresías en tiempo real.
              </p>
            </div>

            <button 
              onClick={abrirModalNuevo}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
          </div>

          {/* Barra de Filtro y Búsqueda */}
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar cliente por DNI, Nombre o Correo..."
                className="w-full bg-[#060606] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Chips de filtro */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'ACTIVA', label: 'Activos' },
                { id: 'VENCIDA', label: 'Vencidos / Morosos' },
                { id: 'SIN_MEMBRESIA', label: 'Sin Membresía' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroEstado(f.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    filtroEstado === f.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Clientes */}
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#141414] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="p-5">DNI</th>
                    <th className="p-5">Cliente</th>
                    <th className="p-5">Correo</th>
                    <th className="p-5">Membresía</th>
                    <th className="p-5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cargando ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-500">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs uppercase tracking-wider font-bold">Cargando base de clientes...</p>
                      </td>
                    </tr>
                  ) : sociosFiltrados.length > 0 ? (
                    sociosFiltrados.map((s, i) => (
                      <tr key={s.id || i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-5 font-mono text-gray-300 font-bold">
                          {s.dni || 'Sin DNI'}
                        </td>
                        <td className="p-5">
                          <p className="font-bold text-white text-base leading-tight">{s.nombres} {s.apellidos}</p>
                          {s.telefono && <p className="text-xs text-gray-500 font-mono mt-0.5">📞 {s.telefono}</p>}
                        </td>
                        <td className="p-5 text-gray-400 text-xs">
                          {s.correo || s.usuario?.correo || 'Sin correo registrado'}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                              s.estadoMembresia === 'ACTIVA' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : s.estadoMembresia === 'MOROSO' || s.estadoMembresia === 'VENCIDA'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-white/5 text-gray-400 border-white/10'
                            }`}>
                              {s.estadoMembresia || 'SIN MEMBRESÍA'}
                            </span>
                            {s.plan && s.plan !== '-' && (
                              <span className="text-xs text-gray-400 font-medium">({s.plan})</span>
                            )}
                          </div>
                          {s.fechaVencimiento && s.fechaVencimiento !== '-' && (
                            <p className="text-[10px] text-gray-500 font-mono mt-1">Vence: {s.fechaVencimiento}</p>
                          )}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            {/* Acceso */}
                            <button 
                              onClick={() => registrarAcceso(s.id)}
                              className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                              title="Registrar Ingreso / Acceso"
                            >
                              <ScanLine className="w-3.5 h-3.5" /> Acceso
                            </button>

                            {/* Membresía / Pago */}
                            <button 
                              onClick={() => abrirModalPago(s)}
                              className="bg-green-500/10 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/20 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                              title="Cobrar / Renovar Membresía"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Plan
                            </button>

                            {/* Editar */}
                            <button 
                              onClick={() => abrirModalEditar(s)}
                              className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white p-2 rounded-lg transition"
                              title="Editar datos del cliente"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Eliminar */}
                            <button 
                              onClick={() => { setSocioSeleccionado(s); setModalAbierto('ELIMINAR'); }}
                              className="bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-400 p-2 rounded-lg transition"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-16 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-bold text-base text-gray-300 mb-1">Sin Resultados</p>
                        <p className="text-xs">No se encontraron clientes que coincidan con la búsqueda o filtro.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL: REGISTRAR / EDITAR CLIENTE */}
        <AnimatePresence>
        {(modalAbierto === 'NUEVO' || modalAbierto === 'EDITAR') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex justify-between items-center">
                <div>
                  <h3 className="font-black text-2xl text-white tracking-tight">
                    {modalAbierto === 'NUEVO' ? 'REGISTRAR CLIENTE' : 'EDITAR CLIENTE'}
                  </h3>
                  <p className="text-gray-400 text-xs">Información del socio en GYMSTAR</p>
                </div>
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={modalAbierto === 'NUEVO' ? submitNuevoSocio : submitEditarSocio} className="p-6 space-y-4">
                {/* DNI con botón RENIEC */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    DNI (Identificador) - Obligatorio
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required 
                      maxLength="8"
                      value={formSocio.dni} 
                      onChange={e => setFormSocio({...formSocio, dni: e.target.value.replace(/\D/g, '')})} 
                      className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm font-mono" 
                      placeholder="72345678" 
                    />
                    {modalAbierto === 'NUEVO' && (
                      <button 
                        type="button" 
                        onClick={consultarDni}
                        disabled={buscandoDni || formSocio.dni.length !== 8}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs px-4 rounded-xl uppercase tracking-wider transition"
                      >
                        {buscandoDni ? 'Buscando...' : 'RENIEC'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Nombres y Apellidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombres</label>
                    <input 
                      type="text" 
                      required 
                      value={formSocio.nombres} 
                      onChange={e => setFormSocio({...formSocio, nombres: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm" 
                      placeholder="Carlos" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Apellidos</label>
                    <input 
                      type="text" 
                      required 
                      value={formSocio.apellidos} 
                      onChange={e => setFormSocio({...formSocio, apellidos: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm" 
                      placeholder="Rodriguez" 
                    />
                  </div>
                </div>

                {/* Correo y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required 
                      value={formSocio.correo} 
                      onChange={e => setFormSocio({...formSocio, correo: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm" 
                      placeholder="carlos@gym.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Teléfono / WhatsApp</label>
                    <input 
                      type="tel" 
                      value={formSocio.telefono} 
                      onChange={e => setFormSocio({...formSocio, telefono: e.target.value})} 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm font-mono" 
                      placeholder="987654321" 
                    />
                  </div>
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    value={formSocio.fechaNacimiento} 
                    onChange={e => setFormSocio({...formSocio, fechaNacimiento: e.target.value})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm" 
                  />
                </div>

                {/* Opción para Activar Plan Inicial en Nuevo Cliente */}
                {modalAbierto === 'NUEVO' && (
                  <div className="pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formSocio.activarPlan} 
                        onChange={e => setFormSocio({...formSocio, activarPlan: e.target.checked})} 
                        className="w-4 h-4 rounded text-blue-600 bg-[#050505] border-white/20 focus:ring-0" 
                      />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Activar Membresía Inicial Inmediata</span>
                    </label>

                    {formSocio.activarPlan && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#050505] p-3 rounded-xl border border-white/10">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Plan</label>
                          <select 
                            value={formSocio.idPlan} 
                            onChange={e => setFormSocio({...formSocio, idPlan: e.target.value})} 
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white text-xs"
                          >
                            <optgroup label="Por Mes (30 días)">
                              {planes.filter(p => p.duracionDias === 30).map(p => (
                                <option key={p.id} value={p.id}>{p.nombrePlan} - S/{p.tarifa}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Por Trimestre (90 días)">
                              {planes.filter(p => p.duracionDias === 90).map(p => (
                                <option key={p.id} value={p.id}>{p.nombrePlan} - S/{p.tarifa}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Por Anual (360 días)">
                              {planes.filter(p => p.duracionDias === 360).map(p => (
                                <option key={p.id} value={p.id}>{p.nombrePlan} - S/{p.tarifa}</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de Pago</label>
                          <select 
                            value={formSocio.idMetodoPago} 
                            onChange={e => setFormSocio({...formSocio, idMetodoPago: Number(e.target.value)})} 
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white text-xs"
                          >
                            <option value={1}>Efectivo</option>
                            <option value={2}>Tarjeta</option>
                            <option value={3}>Transferencia</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-white/5 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setModalAbierto(null)} 
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={guardando} 
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-lg shadow-blue-600/30"
                  >
                    {guardando ? 'Guardando...' : (modalAbierto === 'NUEVO' ? 'Guardar Cliente' : 'Actualizar Cliente')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* MODAL: COBRAR / RENOVAR MEMBRESÍA */}
        <AnimatePresence>
        {modalAbierto === 'PAGO' && socioSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex justify-between items-center">
                <div>
                  <h3 className="font-black text-2xl text-white tracking-tight">COBRAR MEMBRESÍA</h3>
                  <p className="text-gray-400 text-xs">
                    Socio: <strong className="text-white">{socioSeleccionado.nombres} {socioSeleccionado.apellidos}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={submitPago} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Seleccionar Plan de Membresía
                  </label>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                    {[
                      { etiqueta: 'Por Mes (30 días)', dias: 30 },
                      { etiqueta: 'Por Trimestre (90 días)', dias: 90 },
                      { etiqueta: 'Por Anual (360 días)', dias: 360 }
                    ].map(grupo => {
                      const planesGrupo = planes.filter(p => p.duracionDias === grupo.dias);
                      if (planesGrupo.length === 0) return null;
                      return (
                        <div key={grupo.dias} className="space-y-1.5">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 pl-1">{grupo.etiqueta}</p>
                          {planesGrupo.map(p => (
                            <label 
                              key={p.id}
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                                Number(formPago.idPlan) === p.id 
                                  ? 'bg-blue-600/10 border-blue-500 text-white' 
                                  : 'bg-[#050505] border-white/10 text-gray-300 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input 
                                  type="radio" 
                                  name="planSelect" 
                                  checked={Number(formPago.idPlan) === p.id} 
                                  onChange={() => setFormPago({...formPago, idPlan: p.id})} 
                                  className="text-blue-600"
                                />
                                <div>
                                  <p className="font-bold text-sm text-white">{p.nombrePlan}</p>
                                  <p className="text-[10px] text-gray-500">{p.duracionDias} días de acceso</p>
                                </div>
                              </div>
                              <span className="text-base font-black text-blue-400">S/ {p.tarifa}</span>
                            </label>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Método de Pago
                  </label>
                  <select 
                    value={formPago.idMetodoPago} 
                    onChange={e => setFormPago({...formPago, idMetodoPago: Number(e.target.value)})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 text-sm font-medium"
                  >
                    <option value={1}>Efectivo en Caja</option>
                    <option value={2}>Tarjeta de Débito / Crédito</option>
                    <option value={3}>Transferencia Bancaria / Yape / Plin</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-white/5 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setModalAbierto(null)} 
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={guardando || !formPago.idPlan} 
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" /> {guardando ? 'Procesando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* MODAL: ELIMINAR SOCIO */}
        <AnimatePresence>
        {modalAbierto === 'ELIMINAR' && socioSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0f0f0f] border border-red-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-black text-2xl text-white mb-2 tracking-tight">¿ELIMINAR CLIENTE?</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Estás a punto de eliminar a <strong className="text-white">{socioSeleccionado.nombres} {socioSeleccionado.apellidos}</strong> (DNI: {socioSeleccionado.dni || 'S/D'}). Se borrarán sus accesos, pagos y registros asociados.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setModalAbierto(null)} 
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={ejecutarEliminar} 
                  disabled={guardando} 
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30"
                >
                  {guardando ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

      </main>
    </div>
  );
}
