package pe.gym.backend.modulo_seguridad.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_seguridad.dto.GoogleLoginRequest;
import pe.gym.backend.modulo_seguridad.dto.LoginRequest;
import pe.gym.backend.modulo_seguridad.dto.LoginResponse;
import pe.gym.backend.modulo_seguridad.dto.RegistroRequest;
import pe.gym.backend.modulo_seguridad.entity.Rol;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.repository.RolRepository;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;
import pe.gym.backend.security.JwtService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SocioRepository socioRepository;
    private final pe.gym.backend.modulo_entrenamiento.repository.EntrenadorRepository entrenadorRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // Almacenamiento en memoria para códigos de verificación con expiración
    private static class CodigoData {
        final String codigo;
        final LocalDateTime expiracion;

        CodigoData(String codigo, LocalDateTime expiracion) {
            this.codigo = codigo;
            this.expiracion = expiracion;
        }
    }
    private final Map<String, CodigoData> codigosVerificacion = new ConcurrentHashMap<>();

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository,
                       RolRepository rolRepository,
                       SocioRepository socioRepository,
                       pe.gym.backend.modulo_entrenamiento.repository.EntrenadorRepository entrenadorRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.socioRepository = socioRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        String correoLimpio = request.getCorreo().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByCorreo(correoLimpio)
                .orElseThrow(() -> new RuntimeException("No existe ninguna cuenta registrada con este correo. Puedes crear una con tu correo Gmail."));

        boolean passValida = passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())
                || request.getContrasena().equals(usuario.getContrasena());

        if (!passValida) {
            throw new RuntimeException("Contraseña incorrecta.");
        }

        return generarTokenPara(usuario);
    }

    @Transactional
    public LoginResponse loginGoogle(GoogleLoginRequest request) {
        String correoLower = request.getCorreo().trim().toLowerCase();
        return usuarioRepository.findByCorreo(correoLower)
                .map(this::generarTokenPara)
                .orElseGet(() -> {
                    if (!correoLower.endsWith("@gmail.com")) {
                        throw new RuntimeException("Solo se permiten cuentas con el dominio @gmail.com");
                    }
                    return registrarConGoogle(request);
                });
    }

    public Map<String, Object> enviarCodigoVerificacion(String correo) {
        if (correo == null || correo.trim().isBlank()) {
            throw new RuntimeException("El correo es obligatorio.");
        }
        String correoLower = correo.trim().toLowerCase();

        if (!correoLower.endsWith("@gmail.com")) {
            throw new RuntimeException("Solo se permiten correos con el dominio @gmail.com");
        }

        if (usuarioRepository.existsByCorreo(correoLower)) {
            throw new RuntimeException("Este correo ya está registrado en el sistema. Inicia sesión directamente.");
        }

        // Generar código de 6 dígitos numéricos
        String codigo = String.format("%06d", ThreadLocalRandom.current().nextInt(100000, 1000000));
        codigosVerificacion.put(correoLower, new CodigoData(codigo, LocalDateTime.now().plusMinutes(15)));

        System.out.println("[VERIFICACIÓN GMAIL] Código generado para " + correoLower + ": " + codigo);

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("exito", true);
        respuesta.put("mensaje", "Código de verificación generado para validar tu correo Gmail.");
        respuesta.put("correo", correoLower);
        respuesta.put("codigoDemo", codigo);
        return respuesta;
    }

    public boolean verificarCodigo(String correo, String codigo) {
        if (correo == null || codigo == null) return false;
        String correoLower = correo.trim().toLowerCase();
        CodigoData data = codigosVerificacion.get(correoLower);
        if (data == null) {
            throw new RuntimeException("No se ha enviado ningún código a este correo o ya fue utilizado.");
        }
        if (LocalDateTime.now().isAfter(data.expiracion)) {
            codigosVerificacion.remove(correoLower);
            throw new RuntimeException("El código de verificación ha expirado. Solicita un nuevo código.");
        }
        if (!data.codigo.equals(codigo.trim())) {
            throw new RuntimeException("El código de verificación ingresado no es válido.");
        }
        return true;
    }

    @Transactional
    public LoginResponse registro(RegistroRequest request) {
        String correoLower = request.getCorreo().trim().toLowerCase();

        if (!correoLower.endsWith("@gmail.com")) {
            throw new RuntimeException("Solo se permiten correos con el dominio @gmail.com");
        }

        if (usuarioRepository.existsByCorreo(correoLower)) {
            throw new RuntimeException("Este correo ya está registrado en el sistema. Inicia sesión en su lugar.");
        }

        verificarCodigo(correoLower, request.getCodigoVerificacion());
        codigosVerificacion.remove(correoLower); // Consumir código

        Rol rol = rolRepository.findByNombreRol("SOCIO")
                .orElseThrow(() -> new RuntimeException("Rol SOCIO no encontrado"));

        Usuario usuario = new Usuario();
        usuario.setRol(rol);
        usuario.setCorreo(correoLower);
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena().trim()));
        usuario.setEstado(true);
        usuarioRepository.save(usuario);

        String nombre = request.getNombre().trim();
        String[] partes = nombre.split("\\s+");
        String nom = partes[0];
        String ape = partes.length > 1 ? String.join(" ", Arrays.copyOfRange(partes, 1, partes.length)) : "";

        Socio socio = new Socio();
        socio.setUsuario(usuario);
        socio.setNombres(nom);
        socio.setApellidos(ape.isEmpty() ? "Socio" : ape);
        socioRepository.save(socio);

        return generarTokenPara(usuario);
    }

    public Map<String, Object> validarCorreoDisponibilidad(String correo) {
        Map<String, Object> res = new LinkedHashMap<>();
        if (correo == null || correo.trim().isBlank()) {
            res.put("valido", false);
            res.put("mensaje", "El correo no puede estar vacío.");
            return res;
        }
        String c = correo.trim().toLowerCase();
        boolean formatoValido = c.matches("^[A-Za-z0-9._%+-]+@gmail\\.com$");
        if (!formatoValido) {
            res.put("valido", false);
            res.put("mensaje", "El correo debe tener un formato válido y pertenecer al dominio @gmail.com");
            return res;
        }
        boolean existe = usuarioRepository.existsByCorreo(c);
        if (existe) {
            res.put("valido", false);
            res.put("disponible", false);
            res.put("mensaje", "Este correo ya está registrado en el sistema.");
            return res;
        }
        res.put("valido", true);
        res.put("disponible", true);
        res.put("mensaje", "Correo @gmail.com válido y disponible para registro.");
        return res;
    }

    public Map<String, Object> perfil(String correo) {
        Usuario u = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idUsuario", u.getId());
        m.put("correo", u.getCorreo());
        m.put("rol", u.getRol().getNombreRol());
        
        if ("ENTRENADOR".equals(u.getRol().getNombreRol())) {
            entrenadorRepository.findByUsuarioId(u.getId()).ifPresent(e -> {
                m.put("idEntrenador", e.getId());
                m.put("nombres", e.getNombres());
                m.put("apellidos", e.getApellidos());
                m.put("dni", e.getDni());
                m.put("especialidad", e.getEspecialidad());
            });
        } else {
            socioRepository.findByUsuarioId(u.getId()).ifPresentOrElse(
                    s -> { m.put("idSocio", s.getId()); m.put("nombres", s.getNombres()); m.put("apellidos", s.getApellidos()); },
                    () -> { m.put("nombres", null); m.put("apellidos", null); });
        }
        return m;
    }

    private LoginResponse generarTokenPara(Usuario usuario) {
        if (!usuario.getEstado()) {
            throw new RuntimeException("Usuario desactivado - RN-21");
        }
        String token = jwtService.generateToken(usuario.getCorreo(), usuario.getRol().getNombreRol());
        return new LoginResponse(token, usuario.getCorreo(), usuario.getRol().getNombreRol());
    }

    private LoginResponse registrarConGoogle(GoogleLoginRequest request) {
        String correoLower = request.getCorreo().toLowerCase();
        String rolNombre = "SOCIO";
        if (correoLower.contains("entrenador") || correoLower.contains("coach")) {
            rolNombre = "ENTRENADOR";
        } else if (correoLower.contains("recepcion")) {
            rolNombre = "RECEPCIONISTA";
        } else if (correoLower.contains("gerente") || correoLower.contains("admin")) {
            rolNombre = "GERENTE";
        }

        Rol rol = rolRepository.findByNombreRol(rolNombre)
                .orElseGet(() -> rolRepository.findByNombreRol("SOCIO").orElseThrow());

        Usuario usuario = new Usuario();
        usuario.setRol(rol);
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(UUID.randomUUID().toString()));
        usuario.setEstado(true);
        usuarioRepository.save(usuario);

        String nombre = (request.getNombre() == null || request.getNombre().isBlank())
                ? request.getCorreo().split("@")[0] : request.getNombre();
        String[] partes = nombre.trim().split("\\s+");
        String nom = partes[0];
        String ape = partes.length > 1
                ? String.join(" ", Arrays.copyOfRange(partes, 1, partes.length)) : "";

        if ("ENTRENADOR".equals(rolNombre)) {
            pe.gym.backend.modulo_entrenamiento.entity.Entrenador entrenador = new pe.gym.backend.modulo_entrenamiento.entity.Entrenador();
            entrenador.setUsuario(usuario);
            entrenador.setDni("70000000");
            entrenador.setNombres(nom);
            entrenador.setApellidos(ape.isEmpty() ? "Entrenador" : ape);
            entrenador.setEspecialidad("Entrenamiento Funcional y Musculación");
            entrenadorRepository.save(entrenador);
        } else if ("SOCIO".equals(rolNombre)) {
            Socio socio = new Socio();
            socio.setUsuario(usuario);
            socio.setNombres(nom);
            socio.setApellidos(ape.isEmpty() ? "Socio" : ape);
            socioRepository.save(socio);
        }

        String token = jwtService.generateToken(usuario.getCorreo(), rol.getNombreRol());
        return new LoginResponse(token, usuario.getCorreo(), rol.getNombreRol());
    }
}
