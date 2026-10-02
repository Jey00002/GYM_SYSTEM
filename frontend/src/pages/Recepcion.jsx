import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, ScanLine, LogOut, CheckCircle, XCircle, Trash2, AlertTriangle, Fingerprint } from 'lucide-react';
import api from '../services/api';

export default function Recepcion() {
  const [aforo, setAforo] = useState({ actual: 0, maximo: 100 });
  const [busqueda, setBusqueda] = useState('');
  const [socios, setSocios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [resultadoAcceso, setResultadoAcceso] = useState(null); // { tipo: 'AUTORIZADO' | 'DENEGADO', mensaje: '' }
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarAforo();
    buscarSocios({ preventDefault: () => {} });
    const interval = setInterval(cargarAforo, 30000); // actualiza cada 30s
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

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  const buscarSocios = async (e) => {
    e.preventDefault();
    setCargando(true);
    setBusquedaRealizada(true);
    try {
      const res = await api.get('/socios');
      if (!busqueda.trim()) {
        setSocios(res.data);
      } else {
        const lowerQ = busqueda.toLowerCase();
        const filtrados = res.data.filter(s => 
          (s.dni && s.dni.includes(lowerQ)) || 
          (s.nombres && s.nombres.toLowerCase().includes(lowerQ)) ||
          (s.apellidos && s.apellidos.toLowerCase().includes(lowerQ))
        );
        setSocios(filtrados);
      }
    } catch (e) {
      setResultadoAcceso({ tipo: 'DENEGADO', mensaje: 'Error de conexión al buscar socios' });
      setTimeout(() => setResultadoAcceso(null), 3000);
    } finally {
      setCargando(false);
    }
  };

  const escanearQR = async (idSocio) => {
    try {
      const res = await api.post('/accesos', { idSocio, metodo: 'QR' });
      setResultadoAcceso({
        tipo: res.data.resultado || 'AUTORIZADO',
        mensaje: res.data.mensaje || 'Acceso registrado correctamente'
      });
      cargarAforo();
    } catch (e) {
      setResultadoAcceso({
        tipo: 'DENEGADO',
        mensaje: e.response?.data?.message || 'Error al procesar el acceso'
      });
    }
    
    // Ocultar el banner después de 3 segundos
    setTimeout(() => {
      setResultadoAcceso(null);
    }, 3000);
  };

  const eliminarSocio = async (idSocio) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente a este cliente?")) return;
    try {
      await api.delete(`/socios/${idSocio}`);
      setSocios(socios.filter(s => s.id !== idSocio));
      setResultadoAcceso({ tipo: 'AUTORIZADO', mensaje: 'Cliente eliminado exitosamente' });
      setTimeout(() => setResultadoAcceso(null), 3000);
    } catch (e) {
      const msg = e.response?.data?.error || 'Hubo un error al eliminar el cliente';
      setResultadoAcceso({ tipo: 'DENEGADO', mensaje: msg });
      setTimeout(() => setResultadoAcceso(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col md:flex-row selection:bg-blue-600/30">
      <aside className="w-full md:w-72 bg-[#0a0a0a] border-r border-white/5 p-8 flex flex-col relative overflow-hidden">
        {/* Efecto de luz cinematográfico */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="text-3xl font-black tracking-tighter mb-12 relative z-10">
          GYM<span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">STAR</span>
        </div>
        
        <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-center mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Fingerprint className="w-10 h-10 text-blue-600 mx-auto mb-3 drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Aforo en Tiempo Real</p>
          <p className="text-5xl font-black tracking-tighter text-white tracking-tighter">{aforo.actual}</p>
          <div className="w-full bg-black/50 h-1.5 rounded-full mt-5 overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((aforo.actual / aforo.maximo) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${aforo.actual >= aforo.maximo * 0.9 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`}
            />
          </div>
          <p className="text-[10px] font-mono text-gray-500 mt-3 uppercase tracking-wider">Capacidad Máxima: {aforo.maximo}</p>
        </div>

        <div className="flex-1"></div>

        <button 
          onClick={cerrarSesion}
          className="flex items-center justify-center gap-3 px-4 py-4 text-red-500 hover:text-white hover:bg-red-500/20 rounded-xl transition-all text-xs font-black uppercase tracking-wider w-full border border-transparent hover:border-red-500/30"
        >
          <LogOut className="w-4 h-4" /> Desconectar
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-12 relative overflow-y-auto">
        {/* BANNER DE ACCESO MEJORADO */}
        <AnimatePresence>
          {resultadoAcceso && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-4 backdrop-blur-md ${
                resultadoAcceso.tipo === 'AUTORIZADO' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {resultadoAcceso.tipo === 'AUTORIZADO' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <div>
                <p className="font-black text-sm uppercase tracking-widest">{resultadoAcceso.tipo}</p>
                <p className="text-xs font-medium opacity-80 mt-0.5">{resultadoAcceso.mensaje}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase tracking-tighter mb-2">Punto de Control</h2>
            <p className="text-gray-400 text-sm font-medium tracking-wide">Busca un socio para registrar su acceso a las instalaciones.</p>
          </header>
          
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
            <form onSubmit={buscarSocios} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  value={busqueda}
                  onChange={e => {
                    setBusqueda(e.target.value);
                    if (e.target.value === '') {
                      setSocios([]);
                      setBusquedaRealizada(false);
                    }
                  }}
                  placeholder="DNI, Nombres o Apellidos..."
                  className="w-full bg-[#111] border border-white/10 rounded-xl py-4 pl-14 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/50 transition-all font-medium text-sm"
                />
              </div>
              <button 
                type="submit" 
                disabled={cargando || !busqueda.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-gray-500 text-white font-black px-10 py-4 rounded-xl uppercase tracking-widest text-sm transition-all disabled:border-white/10 disabled:border whitespace-nowrap"
              >
                {cargando ? 'Analizando...' : 'Localizar'}
              </button>
            </form>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#111] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="p-6">Identificador (DNI)</th>
                    <th className="p-6">Nombres Completos</th>
                    <th className="p-6">Apellidos</th>
                    <th className="p-6 text-center">Acciones de Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cargando ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-gray-500">
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex flex-col items-center gap-3">
                          <ScanLine className="w-8 h-8 text-blue-600/50" />
                          <p className="text-xs uppercase tracking-widest font-bold">Buscando coincidencias...</p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : socios.length > 0 ? (
                    socios.map((s, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-6 font-mono text-gray-400 group-hover:text-white transition-colors">{s.dni}</td>
                        <td className="p-6 font-bold text-white text-base">{s.nombres}</td>
                        <td className="p-6 text-gray-300">{s.apellidos}</td>
                        <td className="p-6 flex justify-center gap-3">
                          <button 
                            onClick={() => escanearQR(s.id)}
                            className="bg-white/5 hover:bg-blue-600/10 text-white hover:text-blue-500 border border-transparent hover:border-blue-600/30 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2 transition-all"
                          >
                            <ScanLine className="w-3.5 h-3.5" /> Registrar Acceso
                          </button>
                          <button 
                            onClick={() => eliminarSocio(s.id)}
                            className="bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-500 px-3 py-2.5 rounded-lg font-black inline-flex items-center gap-2 transition-all"
                            title="Eliminar Cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : busquedaRealizada ? (
                    <tr>
                      <td colSpan="4" className="p-16 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold text-lg text-gray-300 mb-1">Sin Resultados</p>
                        <p className="text-sm">No se encontraron clientes que coincidan con la búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-16 text-center text-gray-600">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium text-sm tracking-wide">Introduce un DNI o nombre para comenzar la búsqueda.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
