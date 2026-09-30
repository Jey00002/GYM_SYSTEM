import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, CreditCard, Activity, Calendar, History, LogOut, 
  Search, Save, Dumbbell, AlertCircle 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../services/api';

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
      const [perfRes, rutRes, medRes, pagRes, accRes] = await Promise.all([
        api.get('/panel-socio/perfil'),
        api.get('/panel-socio/rutina').catch(() => ({ data: null })),
        api.get('/panel-socio/mediciones').catch(() => ({ data: [] })),
        api.get('/panel-socio/pagos').catch(() => ({ data: [] })),
        api.get('/panel-socio/accesos').catch(() => ({ data: [] }))
      ]);

      setPerfil(perfRes.data);
      setFormData({
        dni: perfRes.data.dni || '',
        nombres: perfRes.data.nombres || '',
        apellidos: perfRes.data.apellidos || '',
        telefono: perfRes.data.telefono || '',
        fechaNacimiento: perfRes.data.fechaNacimiento || '',
        peso: medRes.data.length > 0 ? medRes.data[0].peso : ''
      });
      setRutina(rutRes.data);
      setMediciones([...medRes.data].reverse());
      setPagos(pagRes.data);
      setAccesos(accRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
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
      cargarDatos();
    } catch (e) {
      setMensajeForm({ type: 'error', text: 'Error al guardar los datos.' });
    } finally {
      setGuardando(false);
    }
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
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#141414] border-r border-white/5 p-6 flex flex-col">
        <div className="text-2xl italic-heavy tracking-tighter mb-10">
          GYM<span className="text-orange-500">STAR</span>
        </div>
        
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 font-bold text-lg border border-orange-500/20">
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
                  active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={tab}>
          
          {tab === 'membresia' && (
            <div className="max-w-2xl">
              <h2 className="text-3xl italic-heavy mb-8">MI MEMBRESÍA</h2>
              {perfil?.membresiaActiva ? (
                <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                  
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
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="font-bold">Estado: {perfil.membresiaActiva.estado || 'ACTIVA'}</span>
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
                  <p className="text-gray-400 mb-6">Actualmente no cuentas con un plan activo. Compra un plan en la sección inicial para acceder al gimnasio.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'rutina' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl italic-heavy mb-8">MI RUTINA</h2>
              {rutina ? (
                <div className="bg-[#141414] border border-white/5 rounded-3xl p-8">
                  <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/5">
                    <div>
                      <h3 className="text-2xl font-bold text-orange-500">{rutina.nombreRutina}</h3>
                      <p className="text-gray-400 text-sm mt-1">Asignada por: {rutina.entrenador?.nombres || 'Entrenador'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rutina.ejercicios?.map((ej, i) => (
                      <div key={i} className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">{ej.ejercicio?.nombreEjercicio}</p>
                          <p className="text-gray-500 text-xs uppercase">{ej.ejercicio?.grupoMuscular}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-2xl text-orange-500">{ej.series} <span className="text-sm text-gray-400 font-normal">series</span></p>
                          <p className="font-black text-2xl text-orange-500">{ej.repeticiones} <span className="text-sm text-gray-400 font-normal">reps</span></p>
                        </div>
                      </div>
                    ))}
                    {(!rutina.ejercicios || rutina.ejercicios.length === 0) && (
                      <p className="text-gray-500">No hay ejercicios asignados en esta rutina.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#141414] border border-white/5 rounded-3xl p-10 text-center">
                  <Dumbbell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Sin Rutina Asignada</h3>
                  <p className="text-gray-400">Pide a un entrenador que te asigne una rutina desde su panel.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'progreso' && (
            <div className="max-w-4xl">
              <h2 className="text-3xl italic-heavy mb-8">MI PROGRESO</h2>
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
                          itemStyle={{ color: '#f97316' }}
                        />
                        <Line type="monotone" dataKey="peso" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 5 }} activeDot={{ r: 8 }} />
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
              <h2 className="text-3xl italic-heavy mb-8">MIS PAGOS</h2>
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
              <h2 className="text-3xl italic-heavy mb-8">MIS ACCESOS</h2>
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
              <h2 className="text-3xl italic-heavy mb-8">MIS DATOS</h2>
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
                          className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
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
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Apellidos</label>
                      <input 
                        type="text" 
                        value={formData.apellidos} 
                        onChange={e => setFormData({...formData, apellidos: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Teléfono (9 dígitos)</label>
                      <input 
                        type="text" 
                        maxLength="9"
                        value={formData.telefono} 
                        onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
                        placeholder="Ej. 987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Fecha Nacimiento</label>
                      <input 
                        type="date" 
                        value={formData.fechaNacimiento} 
                        onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
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
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={guardando}
                    className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide transition-all disabled:opacity-50 w-full md:w-auto"
                  >
                    <Save className="w-5 h-5" /> {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
