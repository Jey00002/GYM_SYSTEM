package pe.gym.backend.modulo_seguridad;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.gym.backend.modulo_entrenamiento.repository.EntrenadorRepository;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_seguridad.dto.LoginRequest;
import pe.gym.backend.modulo_seguridad.dto.LoginResponse;
import pe.gym.backend.modulo_seguridad.dto.RegistroRequest;
import pe.gym.backend.modulo_seguridad.entity.Rol;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.repository.RolRepository;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;
import pe.gym.backend.modulo_seguridad.service.AuthService;
import pe.gym.backend.security.JwtService;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private RolRepository rolRepository;
    @Mock
    private SocioRepository socioRepository;
    @Mock
    private EntrenadorRepository entrenadorRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                authenticationManager,
                usuarioRepository,
                rolRepository,
                socioRepository,
                entrenadorRepository,
                jwtService,
                passwordEncoder
        );
    }

    @Test
    void testRechazarCorreoSinDominioGmail() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.enviarCodigoVerificacion("usuario@hotmail.com");
        });
        assertTrue(ex.getMessage().contains("Solo se permiten correos con el dominio @gmail.com"));
    }

    @Test
    void testAceptarCorreoConDominioGmailYGenerarCodigo() {
        when(usuarioRepository.existsByCorreo("juan.perez@gmail.com")).thenReturn(false);

        Map<String, Object> resp = authService.enviarCodigoVerificacion("juan.perez@gmail.com");
        assertTrue((Boolean) resp.get("exito"));
        assertNotNull(resp.get("codigoDemo"));
        assertEquals(6, ((String) resp.get("codigoDemo")).length());
    }

    @Test
    void testValidarCorreoDisponibilidad() {
        Map<String, Object> respInvalido = authService.validarCorreoDisponibilidad("prueba@yahoo.com");
        assertFalse((Boolean) respInvalido.get("valido"));

        when(usuarioRepository.existsByCorreo("prueba@gmail.com")).thenReturn(false);
        Map<String, Object> respValido = authService.validarCorreoDisponibilidad("prueba@gmail.com");
        assertTrue((Boolean) respValido.get("valido"));
        assertTrue((Boolean) respValido.get("disponible"));
    }

    @Test
    void testRegistroExitosoConGmailYCodigo() {
        String correo = "nuevo.socio@gmail.com";
        when(usuarioRepository.existsByCorreo(correo)).thenReturn(false);

        // 1. Generar código
        Map<String, Object> respCodigo = authService.enviarCodigoVerificacion(correo);
        String codigo = (String) respCodigo.get("codigoDemo");

        // 2. Configurar mocks para guardar
        Rol rolSocio = new Rol();
        rolSocio.setId(5L);
        rolSocio.setNombreRol("SOCIO");
        when(rolRepository.findByNombreRol("SOCIO")).thenReturn(Optional.of(rolSocio));
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPass123");
        when(jwtService.generateToken(anyString(), anyString())).thenReturn("fake.jwt.token");

        // 3. Ejecutar registro
        RegistroRequest req = new RegistroRequest();
        req.setNombre("Carlos Mendoza");
        req.setCorreo(correo);
        req.setContrasena("clave123");
        req.setCodigoVerificacion(codigo);

        LoginResponse resp = authService.registro(req);

        assertNotNull(resp);
        assertEquals(correo, resp.getCorreo());
        assertEquals("SOCIO", resp.getRol());
        assertEquals("fake.jwt.token", resp.getToken());

        verify(usuarioRepository, times(1)).save(any(Usuario.class));
        verify(socioRepository, times(1)).save(any());
    }

    @Test
    void testRegistroFallaConCodigoInvalido() {
        String correo = "pedro@gmail.com";
        when(usuarioRepository.existsByCorreo(correo)).thenReturn(false);

        authService.enviarCodigoVerificacion(correo);

        RegistroRequest req = new RegistroRequest();
        req.setNombre("Pedro Ramos");
        req.setCorreo(correo);
        req.setContrasena("clave123");
        req.setCodigoVerificacion("000000"); // Código erróneo

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.registro(req);
        });
        assertTrue(ex.getMessage().contains("no es válido"));
    }

    @Test
    void testLoginConUsuarioNoExistenteIndicaCrearCuenta() {
        when(usuarioRepository.findByCorreo("desconocido@gmail.com")).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setCorreo("desconocido@gmail.com");
        req.setContrasena("123456");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.login(req);
        });
        assertTrue(ex.getMessage().contains("No existe ninguna cuenta"));
        assertTrue(ex.getMessage().contains("crear una con tu correo Gmail"));
    }
}
