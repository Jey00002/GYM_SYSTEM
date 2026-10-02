import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, TrendingUp, AlertTriangle, LogOut, ArrowRight, Activity, DollarSign } from 'lucide-react';
import api from '../services/api';

const MESES = { '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun','07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic' };
const COLORES_ESTADO = { ACTIVA: '#22c55e', MOROSO: '#ef4444', VENCIDA: '#ef4444', SUSPENDIDA: '#2563eb' };

export default function DashboardGerente() {
  const [dashboard, setDashboard] = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [ventasDisciplina, setVentasDisciplina] = useState([]);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
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

  useEffect(() => {
    cargar();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
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
      <aside className="w-full md:w-64 bg-[#141414] border-r border-white/5 p-6 flex flex-col">
        <div className="text-2xl font-black tracking-tighter tracking-tighter mb-10">
          GYM<span className="text-blue-600">STAR</span>
        </div>
        
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Panel de Control</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 text-sm font-bold">
            <Activity className="w-5 h-5" /> Resumen
          </button>
        </div>

        <button 
          onClick={cerrarSesion}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold w-full"
        >
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase tracking-tight mb-2">Visión General</h2>
              <p className="text-gray-400">Monitoreo en tiempo real de operaciones y finanzas.</p>
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
                        formatter={(val, name) => [`S/ ${val}`, 'Ingresos']}
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
        </div>
      </main>
    </div>
  );
}
