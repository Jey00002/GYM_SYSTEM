import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, ScanLine, LogOut, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function Recepcion() {
  const [aforo, setAforo] = useState({ actual: 0, maximo: 100 });
  const [busqueda, setBusqueda] = useState('');
  const [socios, setSocios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [resultadoAcceso, setResultadoAcceso] = useState(null); // { tipo: 'AUTORIZADO' | 'DENEGADO', mensaje: '' }
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarAforo();
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
    if (!busqueda.trim()) return;
    setCargando(true);
    try {
      // Endpoint imaginado/aproximado según la lógica de backend común
      // Como no hay endpoint exacto descrito en requerimientos para buscar socios en recepcion,
      // usaremos el de /finanzas/socios o filtraremos localmente si hubiese un get all.
      // Se asume GET /api/finanzas/socios?q={busqueda}
      const res = await api.get('/finanzas/socios');
      const lowerQ = busqueda.toLowerCase();
      const filtrados = res.data.filter(s => 
        (s.dni && s.dni.includes(lowerQ)) || 
        (s.nombres && s.nombres.toLowerCase().includes(lowerQ)) ||
        (s.apellidos && s.apellidos.toLowerCase().includes(lowerQ))
      );
      setSocios(filtrados);
    } catch (e) {
      console.error('Error buscando socios');
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#141414] border-r border-white/5 p-6 flex flex-col">
        <div className="text-2xl italic-heavy tracking-tighter mb-10">
          GYM<span className="text-orange-500">STAR</span>
        </div>
        
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 text-center mb-8">
          <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Aforo Actual</p>
          <p className="text-4xl italic-heavy text-white">{aforo.actual}</p>
          <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${aforo.actual >= aforo.maximo * 0.9 ? 'bg-red-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min((aforo.actual / aforo.maximo) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Capacidad máx: {aforo.maximo}</p>
        </div>

        <div className="flex-1"></div>

        <button 
          onClick={cerrarSesion}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold w-full"
        >
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-10 relative">
        {/* BANNER DE ACCESO */}
        <AnimatePresence>
          {resultadoAcceso && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              className={`absolute top-6 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 ${
                resultadoAcceso.tipo === 'AUTORIZADO' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}
            >
              {resultadoAcceso.tipo === 'AUTORIZADO' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              <div>
                <p className="font-black text-xl uppercase tracking-wider">{resultadoAcceso.tipo}</p>
                <p className="text-sm opacity-80">{resultadoAcceso.mensaje}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl italic-heavy mb-8 uppercase tracking-tight">Control de Accesos</h2>
          
          <div className="bg-[#141414] border border-white/5 rounded-3xl p-8 mb-8">
            <form onSubmit={buscarSocios} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar socio por DNI o nombre..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                />
              </div>
              <button 
                type="submit" 
                disabled={cargando}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-xl uppercase tracking-wide transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {cargando ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0a0a0a] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-5 font-bold">DNI</th>
                  <th className="p-5 font-bold">Nombres</th>
                  <th className="p-5 font-bold">Apellidos</th>
                  <th className="p-5 font-bold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {socios.length > 0 ? socios.map((s, i) => (
                  <tr key={i} className="hover:bg-white/5 transition">
                    <td className="p-5 font-mono">{s.dni}</td>
                    <td className="p-5 font-bold text-white">{s.nombres}</td>
                    <td className="p-5">{s.apellidos}</td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => escanearQR(s.id)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition"
                      >
                        <ScanLine className="w-4 h-4" /> Escanear QR
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">Usa el buscador para encontrar socios. No se permite registro manual.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
