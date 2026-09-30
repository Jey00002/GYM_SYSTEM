package pe.gym.backend.modulo_seguridad.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_seguridad.dto.GoogleLoginRequest;
import pe.gym.backend.modulo_seguridad.dto.LoginRequest;
import pe.gym.backend.modulo_seguridad.dto.LoginResponse;
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

    @PostMapping("/registro")
    public ResponseEntity<LoginResponse> registro(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.registroCorreo(request));
    }

    @GetMapping("/perfil")
    public ResponseEntity<Map<String, Object>> perfil(Principal principal) {
        if (principal == null) throw new RuntimeException("Sin sesion");
        return ResponseEntity.ok(authService.perfil(principal.getName()));
    }
}
