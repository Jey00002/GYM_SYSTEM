package pe.gym.backend.modulo_finanzas.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_finanzas.dto.SocioRequest;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.service.SocioService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/socios")
public class SocioController {

    private final SocioService socioService;

    public SocioController(SocioService socioService) {
        this.socioService = socioService;
    }

    @PostMapping
    public ResponseEntity<Socio> registrar(@Valid @RequestBody SocioRequest request) {
        return ResponseEntity.ok(socioService.registrarSocio(request));
    }

    @GetMapping
    public ResponseEntity<List<Socio>> listar() {
        return ResponseEntity.ok(socioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Socio> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(socioService.buscarPorId(id));
    }

    @GetMapping("/resumen")
    public ResponseEntity<List<Map<String, Object>>> resumen() {
        return ResponseEntity.ok(socioService.obtenerResumen());
    }

    @GetMapping("/mio")
    public ResponseEntity<Map<String, Object>> mio(Principal principal) {
        return ResponseEntity.ok(socioService.obtenerSocioPorCorreo(principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Socio> actualizar(@PathVariable Long id, @Valid @RequestBody SocioRequest request) {
        return ResponseEntity.ok(socioService.actualizarSocio(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            socioService.eliminarSocio(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
