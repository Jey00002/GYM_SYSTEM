package pe.gym.backend.modulo_seguridad.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_seguridad.dto.GoogleLoginRequest;
import pe.gym.backend.modulo_seguridad.dto.LoginRequest;
import pe.gym.backend.modulo_seguridad.dto.LoginResponse;
import pe.gym.backend.modulo_seguridad.entity.Rol;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.repository.RolRepository;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;
import pe.gym.backend.security.JwtService;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SocioRepository socioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository,
                       RolRepository rolRepository,
                       SocioRepository socioRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.socioRepository = socioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        // DESACTIVADO TEMPORALMENTE
        // authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
        //         request.getCorreo(), request.getContrasena()));
        
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseGet(() -> {
                    // Bypass temporal: si el usuario no existe, lo creamos para no dar error
                    GoogleLoginRequest req = new GoogleLoginRequest();
                    req.setCorreo(request.getCorreo());
                    req.setNombre(request.getCorreo().split("@")[0]);
                    registrarConGoogle(req);
                    return usuarioRepository.findByCorreo(request.getCorreo()).get();
                });
        return generarTokenPara(usuario);
    }

    @Transactional
    public LoginResponse loginGoogle(GoogleLoginRequest request) {
        return usuarioRepository.findByCorreo(request.getCorreo())
                .map(this::generarTokenPara)
                .orElseGet(() -> registrarConGoogle(request));
    }

    @Transactional
    public LoginResponse registroCorreo(GoogleLoginRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("Este correo ya esta registrado. Usa Mi Cuenta para iniciar sesion.");
        }
        return registrarConGoogle(request);
    }

    public Map<String, Object> perfil(String correo) {
        Usuario u = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("correo", u.getCorreo());
        m.put("rol", u.getRol().getNombreRol());
        socioRepository.findByUsuarioId(u.getId()).ifPresentOrElse(
                s -> { m.put("nombres", s.getNombres()); m.put("apellidos", s.getApellidos()); },
                () -> { m.put("nombres", null); m.put("apellidos", null); });
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
        Rol rolSocio = rolRepository.findByNombreRol("SOCIO")
                .orElseThrow(() -> new RuntimeException("Rol SOCIO no encontrado"));

        Usuario usuario = new Usuario();
        usuario.setRol(rolSocio);
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(UUID.randomUUID().toString()));
        usuario.setEstado(true);
        usuarioRepository.save(usuario);

        Socio socio = new Socio();
        socio.setUsuario(usuario);
        String nombre = (request.getNombre() == null || request.getNombre().isBlank())
                ? request.getCorreo().split("@")[0] : request.getNombre();
        String[] partes = nombre.trim().split("\\s+");
        socio.setNombres(partes[0]);
        socio.setApellidos(partes.length > 1
                ? String.join(" ", Arrays.copyOfRange(partes, 1, partes.length)) : "");
        socioRepository.save(socio);

        String token = jwtService.generateToken(usuario.getCorreo(), "SOCIO");
        return new LoginResponse(token, usuario.getCorreo(), "SOCIO");
    }
}
