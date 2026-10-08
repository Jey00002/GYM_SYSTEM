package pe.gym.backend.modulo_finanzas.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_acceso.repository.AccesoRepository;
import pe.gym.backend.modulo_entrenamiento.entity.Rutina;
import pe.gym.backend.modulo_entrenamiento.repository.MedicionBiometricaRepository;
import pe.gym.backend.modulo_entrenamiento.repository.RutinaEjercicioRepository;
import pe.gym.backend.modulo_entrenamiento.repository.RutinaRepository;
import pe.gym.backend.modulo_finanzas.dto.SocioRequest;
import pe.gym.backend.modulo_finanzas.entity.Membresia;
import pe.gym.backend.modulo_finanzas.entity.Pago;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.ComprobanteRepository;
import pe.gym.backend.modulo_finanzas.repository.MembresiaRepository;
import pe.gym.backend.modulo_finanzas.repository.PagoRepository;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_seguridad.entity.Rol;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.repository.RolRepository;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SocioService {

    private final SocioRepository socioRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final MembresiaRepository membresiaRepository;
    private final PagoRepository pagoRepository;
    private final ComprobanteRepository comprobanteRepository;
    private final AccesoRepository accesoRepository;
    private final MedicionBiometricaRepository medicionRepository;
    private final RutinaRepository rutinaRepository;
    private final RutinaEjercicioRepository rutinaEjercicioRepository;

    public SocioService(SocioRepository socioRepository, UsuarioRepository usuarioRepository,
                        RolRepository rolRepository, PasswordEncoder passwordEncoder,
                        MembresiaRepository membresiaRepository, PagoRepository pagoRepository,
                        ComprobanteRepository comprobanteRepository, AccesoRepository accesoRepository,
                        MedicionBiometricaRepository medicionRepository, RutinaRepository rutinaRepository,
                        RutinaEjercicioRepository rutinaEjercicioRepository) {
        this.socioRepository = socioRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.membresiaRepository = membresiaRepository;
        this.pagoRepository = pagoRepository;
        this.comprobanteRepository = comprobanteRepository;
        this.accesoRepository = accesoRepository;
        this.medicionRepository = medicionRepository;
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
    }

    @Transactional
    public Socio registrarSocio(SocioRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya esta registrado");
        }
        Rol rolSocio = rolRepository.findByNombreRol("SOCIO")
                .orElseThrow(() -> new RuntimeException("Rol SOCIO no encontrado"));
        Usuario usuario = new Usuario();
        usuario.setRol(rolSocio);
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode("123456"));
        usuario.setEstado(true);
        usuarioRepository.save(usuario);
        Socio socio = new Socio();
        socio.setUsuario(usuario);
        socio.setDni(request.getDni());
        socio.setNombres(request.getNombres());
        socio.setApellidos(request.getApellidos());
        socio.setTelefono(request.getTelefono());
        socio.setFechaNacimiento(request.getFechaNacimiento());
        return socioRepository.save(socio);
    }

    public List<Map<String, Object>> listarDetallado() {
        List<Socio> socios = socioRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Socio s : socios) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("dni", s.getDni() != null ? s.getDni() : "");
            m.put("nombres", s.getNombres() != null ? s.getNombres() : "");
            m.put("apellidos", s.getApellidos() != null ? s.getApellidos() : "");
            m.put("telefono", s.getTelefono() != null ? s.getTelefono() : "");
            m.put("fechaNacimiento", s.getFechaNacimiento() != null ? s.getFechaNacimiento().toString() : "");
            
            String correo = (s.getUsuario() != null && s.getUsuario().getCorreo() != null) ? s.getUsuario().getCorreo() : "";
            m.put("correo", correo);

            Map<String, Object> uMap = new LinkedHashMap<>();
            if (s.getUsuario() != null) {
                uMap.put("id", s.getUsuario().getId());
                uMap.put("correo", correo);
            }
            m.put("usuario", uMap);

            // Membresia info
            List<Membresia> mems = membresiaRepository.findBySocioId(s.getId());
            if (!mems.isEmpty()) {
                Membresia mem = mems.stream()
                        .max(java.util.Comparator.comparing(Membresia::getFechaVencimiento))
                        .orElse(null);
                if (mem != null) {
                    m.put("estadoMembresia", mem.getEstado());
                    m.put("fechaVencimiento", mem.getFechaVencimiento() != null ? mem.getFechaVencimiento().toString() : "");
                    m.put("plan", mem.getPlanMembresia() != null ? mem.getPlanMembresia().getNombrePlan() : "Plan GYM");
                    m.put("idPlan", mem.getPlanMembresia() != null ? mem.getPlanMembresia().getId() : null);
                }
            } else {
                m.put("estadoMembresia", "SIN_MEMBRESIA");
                m.put("fechaVencimiento", "-");
                m.put("plan", "-");
                m.put("idPlan", null);
            }

            // Rutina activa info
            java.util.Optional<Rutina> rOpt = rutinaRepository.findFirstBySocioIdAndEstadoOrderByIdDesc(s.getId(), "ACTIVA");
            if (rOpt.isPresent()) {
                Rutina r = rOpt.get();
                m.put("tieneRutina", true);
                m.put("rutinaNombre", r.getNombreRutina());
                m.put("idRutina", r.getId());
            } else {
                m.put("tieneRutina", false);
                m.put("rutinaNombre", null);
                m.put("idRutina", null);
            }

            result.add(m);
        }
        return result;
    }

    public List<Socio> listarTodos() {
        return socioRepository.findAll();
    }

    public Socio buscarPorId(Long id) {
        return socioRepository.findById(id).orElseThrow(() -> new RuntimeException("Socio no encontrado"));
    }

    public List<Map<String, Object>> obtenerResumen() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] f : socioRepository.resumenSocios()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", f[0]);
            m.put("nombre", f[1]);
            m.put("dni", f[2]);
            m.put("telefono", f[3]);
            m.put("estado", f[4]);
            m.put("vencimiento", f[5] == null ? "-" : f[5].toString());
            result.add(m);
        }
        return result;
    }

    public Map<String, Object> obtenerSocioPorCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Socio socio = socioRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Tu usuario aun no tiene perfil de socio"));
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", socio.getId());
        m.put("nombres", socio.getNombres());
        m.put("apellidos", socio.getApellidos());
        m.put("dni", socio.getDni());
        return m;
    }

    @Transactional
    public Socio actualizarSocio(Long id, SocioRequest request) {
        Socio socio = socioRepository.findById(id).orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        socio.setNombres(request.getNombres());
        socio.setApellidos(request.getApellidos());
        socio.setDni(request.getDni());
        socio.setTelefono(request.getTelefono());
        if (request.getFechaNacimiento() != null) {
            socio.setFechaNacimiento(request.getFechaNacimiento());
        }
        if (request.getCorreo() != null && !request.getCorreo().isBlank()) {
            if (socio.getUsuario() != null) {
                if (!socio.getUsuario().getCorreo().equalsIgnoreCase(request.getCorreo())) {
                    if (usuarioRepository.existsByCorreo(request.getCorreo())) {
                        throw new RuntimeException("El correo ya esta registrado por otro usuario");
                    }
                    socio.getUsuario().setCorreo(request.getCorreo());
                    usuarioRepository.save(socio.getUsuario());
                }
            } else {
                Rol rolSocio = rolRepository.findByNombreRol("SOCIO")
                        .orElseThrow(() -> new RuntimeException("Rol SOCIO no encontrado"));
                Usuario u = new Usuario();
                u.setRol(rolSocio);
                u.setCorreo(request.getCorreo());
                u.setContrasena(passwordEncoder.encode("123456"));
                u.setEstado(true);
                usuarioRepository.save(u);
                socio.setUsuario(u);
            }
        }
        return socioRepository.save(socio);
    }

    @Transactional
    public void eliminarSocio(Long id) {
        Socio socio = socioRepository.findById(id).orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        
        // Eliminar dependencias en cascada para no dejar datos huerfanos
        List<Membresia> membresias = membresiaRepository.findBySocioId(id);
        for (Membresia mem : membresias) {
            List<Pago> pagos = pagoRepository.findByMembresiaId(mem.getId());
            for (Pago p : pagos) {
                comprobanteRepository.deleteByPagoId(p.getId());
            }
            pagoRepository.deleteByMembresiaId(mem.getId());
        }
        membresiaRepository.deleteBySocioId(id);
        accesoRepository.deleteBySocioId(id);
        medicionRepository.deleteBySocioId(id);
        
        List<Rutina> rutinas = rutinaRepository.findBySocioId(id);
        for (Rutina r : rutinas) {
            rutinaEjercicioRepository.deleteByRutinaId(r.getId());
        }
        rutinaRepository.deleteBySocioId(id);
        
        Usuario usuario = socio.getUsuario();
        socioRepository.delete(socio);
        if (usuario != null) {
            usuarioRepository.delete(usuario);
        }
    }
}
