package pe.gym.backend.modulo_seguridad.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_seguridad.dto.*;
import pe.gym.backend.modulo_seguridad.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/login-google")
    public ResponseEntity<LoginResponse> loginGoogle(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginGoogle(request));
    }

    @PostMapping("/enviar-codigo")
    public ResponseEntity<Void> enviarCodigo(@RequestBody EnviarCodigoRequest request) {
        authService.enviarCodigo(request.getCorreo());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/registro-manual")
    public ResponseEntity<LoginResponse> registroManual(@RequestBody RegistroManualRequest request) {
        return ResponseEntity.ok(authService.registroManual(request));
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<Void> recuperarContrasena(@RequestBody RecuperarContrasenaRequest request) {
        authService.recuperarContrasena(request);
        return ResponseEntity.ok().build();
    }
}
