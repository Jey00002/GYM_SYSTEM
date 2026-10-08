package pe.gym.backend.modulo_seguridad.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_seguridad.dto.*;
import pe.gym.backend.modulo_seguridad.service.AuthService;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/login-google")
    public ResponseEntity<LoginResponse> loginGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginGoogle(request));
    }

    @PostMapping("/enviar-codigo")
    public ResponseEntity<Map<String, Object>> enviarCodigo(@Valid @RequestBody CodigoVerificacionRequest request) {
        return ResponseEntity.ok(authService.enviarCodigoVerificacion(request.getCorreo()));
    }

    @PostMapping("/validar-codigo")
    public ResponseEntity<Map<String, Object>> validarCodigo(@Valid @RequestBody ValidarCodigoRequest request) {
        boolean valido = authService.verificarCodigo(request.getCorreo(), request.getCodigo());
        return ResponseEntity.ok(Map.of("valido", valido, "mensaje", "Código validado exitosamente."));
    }

    @PostMapping("/registro")
    public ResponseEntity<LoginResponse> registro(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.ok(authService.registro(request));
    }

    @GetMapping("/validar-correo")
    public ResponseEntity<Map<String, Object>> validarCorreo(@RequestParam String correo) {
        return ResponseEntity.ok(authService.validarCorreoDisponibilidad(correo));
    }

    @GetMapping("/perfil")
    public ResponseEntity<Map<String, Object>> perfil(Principal principal) {
        if (principal == null) throw new RuntimeException("Sin sesion");
        return ResponseEntity.ok(authService.perfil(principal.getName()));
    }
}
