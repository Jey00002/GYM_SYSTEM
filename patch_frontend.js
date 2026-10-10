const fs = require('fs');

let landing = fs.readFileSync('frontend/src/pages/Landing.jsx', 'utf8');

// Replace the Registration state and add new ones
landing = landing.replace(
  /const \[modalRegistro, setModalRegistro\] = useState\(false\);/,
  `const [modalRegistro, setModalRegistro] = useState(false);
  const [regPaso, setRegPaso] = useState('datos');
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regContrasena, setRegContrasena] = useState('');
  const [regCodigo, setRegCodigo] = useState('');
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);`
);

const newRegistroBody = `
            <div className="relative z-10">
              <span className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mb-2 block">Casting Call</span>
              <h3 className="font-black text-4xl mt-1 mb-3 tracking-tighter uppercase text-white">ÚNETE A<br /><span className="text-blue-600">LA ÉLITE</span></h3>
              
              {regError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 uppercase tracking-wider text-center font-bold">{regError}</div>}
              
              {regPaso === 'datos' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setEnviandoCodigo(true);
                  setRegError('');
                  try {
                    await api.post('/auth/enviar-codigo', { correo: regCorreo });
                    setRegPaso('codigo');
                  } catch(err) {
                    setRegError('Error al enviar el código');
                  } finally {
                    setEnviandoCodigo(false);
                  }
                }} className="space-y-4">
                  <input type="text" placeholder="Tu Nombre" required value={regNombre} onChange={e => setRegNombre(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors" />
                  <input type="email" placeholder="Correo Electrónico" required value={regCorreo} onChange={e => setRegCorreo(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors" />
                  <input type="password" placeholder="Contraseña Segura" required value={regContrasena} onChange={e => setRegContrasena(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors" />
                  <button type="submit" disabled={enviandoCodigo} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all uppercase tracking-wide disabled:opacity-50">
                    {enviandoCodigo ? 'Enviando...' : 'Continuar'}
                  </button>
                </form>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setEnviandoCodigo(true);
                  setRegError('');
                  try {
                    const res = await api.post('/auth/registro-manual', { correo: regCorreo, contrasena: regContrasena, nombre: regNombre, codigo: regCodigo });
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('rol', 'SOCIO');
                    setModalRegistro(false);
                    navigate('/socio');
                  } catch(err) {
                    setRegError('Código incorrecto o error.');
                  } finally {
                    setEnviandoCodigo(false);
                  }
                }} className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">Ingresa el código de 6 dígitos enviado a <span className="text-white font-bold">{regCorreo}</span></p>
                  <input type="text" placeholder="Código de 6 dígitos" required maxLength={6} value={regCodigo} onChange={e => setRegCodigo(e.target.value)} className="w-full bg-[#0a0a0a] text-center text-2xl tracking-[0.5em] font-mono border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors" />
                  <button type="submit" disabled={enviandoCodigo} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all uppercase tracking-wide disabled:opacity-50">
                    {enviandoCodigo ? 'Verificando...' : 'Crear Cuenta'}
                  </button>
                  <button type="button" onClick={() => setRegPaso('datos')} className="w-full py-4 text-gray-500 font-bold uppercase text-xs hover:text-white transition">Volver atrás</button>
                </form>
              )}
              
              <div className="mt-6 flex justify-center bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                <GoogleLogin onSuccess={loginGoogleReal} onError={() => setRegError('Error Google')} theme="filled_black" size="large" text="continue_with" />
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-6 tracking-widest uppercase font-bold">¿Ya eres miembro? <Link to="/login" className="text-white hover:text-blue-600 transition">Inicia Sesión</Link></p>
            </div>
`;

// Replace the content inside modalRegistro
landing = landing.replace(
  /<div className="relative z-10">[\s\S]*?<\/div>\s*<\/motion\.div>/,
  newRegistroBody + '\n          </motion.div>'
);

fs.writeFileSync('frontend/src/pages/Landing.jsx', landing);
