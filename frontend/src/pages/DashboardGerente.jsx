import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, TrendingUp, AlertTriangle, LogOut, ArrowRight, Activity, DollarSign } from 'lucide-react';
import api from '../services/api';

const MESES = { '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun','07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic' };
const COLORES_ESTADO = { ACTIVA: '#22c55e', MOROSO: '#ef4444', VENCIDA: '#ef4444', SUSPENDIDA: '#f97316' };

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
        color: COLORES_ESTADO[x.estado] || '#f97316'
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
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Panel de Control</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 text-sm font-bold">
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
              <h2 className="text-3xl italic-heavy uppercase tracking-tight mb-2">Visión General</h2>
              <p className="text-gray-400">Monitoreo en tiempo real de operaciones y finanzas.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-8 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" /> Hubo un error cargando algunos reportes. Mostrando datos disponibles.
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Aforo Actual</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl italic-heavy">{dashboard?.aforoActual || 0}</h3>
                <span className="text-gray-500">/ {dashboard?.aforoMaximo || 100}</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Ingresos del Mes</p>
              <h3 className="text-4xl italic-heavy">S/ {Number(dashboard?.ingresosMensuales || 0).toFixed(2)}</h3>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Socios Activos</p>
              <h3 className="text-4xl italic-heavy">{dashboard?.sociosActivos || 0}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* GRAFICO INGRESOS */}
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 lg:col-span-2">
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
                        itemStyle={{ color: '#f97316' }}
                      />
                      <Bar dataKey="ingresos" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">Sin datos de ingresos</div>
                )}
              </div>
            </div>

            {/* ESTADOS MEMBRESIA PIE */}
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6">
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
                      <p className="text-2xl italic-heavy">{membresias.reduce((a, b) => a + b.value, 0)}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VENTAS POR DISCIPLINA */}
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6">
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
                          <Cell key={`cell-${index}`} fill={entry.color || '#f97316'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">Sin datos</div>
                )}
              </div>
            </div>

            {/* MEMBRESÍAS POR VENCER */}
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6">
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
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
