package pe.gym.backend.modulo_seguridad.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_seguridad.dto.*;
import pe.gym.backend.modulo_seguridad.entity.Rol;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.entity.CodigoVerificacion;
import pe.gym.backend.modulo_seguridad.repository.RolRepository;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;
import pe.gym.backend.modulo_seguridad.repository.CodigoVerificacionRepository;
import pe.gym.backend.security.JwtService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Random;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SocioRepository socioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CodigoVerificacionRepository codigoRepo;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository,
                       RolRepository rolRepository,
                       SocioRepository socioRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       CodigoVerificacionRepository codigoRepo) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.socioRepository = socioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.codigoRepo = codigoRepo;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getCorreo(), request.getContrasena()));
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));
        return generarTokenPara(usuario);
    }

    @Transactional
    public LoginResponse loginGoogle(GoogleLoginRequest request) {
        return usuarioRepository.findByCorreo(request.getCorreo())
                .map(this::generarTokenPara)
                .orElseThrow(() -> new RuntimeException("Usuario no registrado. Regístrate primero."));
    }

    @Transactional
    public void enviarCodigo(String correo) {
        String codigo = String.format("%06d", new Random().nextInt(999999));
        codigoRepo.deleteByCorreo(correo);
        codigoRepo.save(new CodigoVerificacion(correo, codigo, LocalDateTime.now().plusMinutes(10)));
        emailService.enviarCorreoVerificacion(correo, codigo);
    }

    @Transactional
    public LoginResponse registroManual(RegistroManualRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("Este correo ya esta registrado.");
        }
        validarCodigo(request.getCorreo(), request.getCodigo());
        
        Rol rolSocio = rolRepository.findByNombreRol("SOCIO").orElseThrow();
        Usuario usuario = new Usuario();
        usuario.setRol(rolSocio);
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setEstado(true);
        usuarioRepository.save(usuario);

        Socio socio = new Socio();
        socio.setUsuario(usuario);
        String nombre = (request.getNombre() == null || request.getNombre().isBlank()) ? request.getCorreo().split("@")[0] : request.getNombre();
        String[] partes = nombre.trim().split("\\s+");
        socio.setNombres(partes[0]);
        socio.setApellidos(partes.length > 1 ? String.join(" ", Arrays.copyOfRange(partes, 1, partes.length)) : "");
        socioRepository.save(socio);

        return generarTokenPara(usuario);
    }

    @Transactional
    public void recuperarContrasena(RecuperarContrasenaRequest request) {
        validarCodigo(request.getCorreo(), request.getCodigo());
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
        usuarioRepository.save(usuario);
    }

    private void validarCodigo(String correo, String codigo) {
        CodigoVerificacion cv = codigoRepo.findByCorreoAndCodigo(correo, codigo)
                .orElseThrow(() -> new RuntimeException("Código incorrecto"));
        if (cv.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado");
        }
        codigoRepo.delete(cv);
    }

    private LoginResponse generarTokenPara(Usuario usuario) {
        if (!usuario.getEstado()) throw new RuntimeException("Usuario desactivado - RN-21");
        String token = jwtService.generateToken(usuario.getCorreo(), usuario.getRol().getNombreRol());
        return new LoginResponse(token, usuario.getCorreo(), usuario.getRol().getNombreRol());
    }

    public Map<String, Object> perfil(String correo) {
        Usuario u = usuarioRepository.findByCorreo(correo).orElseThrow();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("correo", u.getCorreo());
        m.put("rol", u.getRol().getNombreRol());
        socioRepository.findByUsuarioId(u.getId()).ifPresentOrElse(
                s -> { m.put("nombres", s.getNombres()); m.put("apellidos", s.getApellidos()); },
                () -> { m.put("nombres", null); m.put("apellidos", null); });
        return m;
    }
}
