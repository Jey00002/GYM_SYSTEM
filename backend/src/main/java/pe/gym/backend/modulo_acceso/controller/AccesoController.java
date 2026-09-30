package pe.gym.backend.modulo_acceso.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_acceso.dto.AccesoRequest;
import pe.gym.backend.modulo_acceso.entity.Acceso;
import pe.gym.backend.modulo_acceso.service.AccesoService;

import java.util.Map;

@RestController
@RequestMapping("/api/accesos")
public class AccesoController {

    private final AccesoService accesoService;

    public AccesoController(AccesoService accesoService) {
        this.accesoService = accesoService;
    }

    @PostMapping
    public ResponseEntity<Acceso> registrar(@Valid @RequestBody AccesoRequest request) {
        return ResponseEntity.ok(accesoService.registrarAcceso(request));
    }

    @GetMapping("/aforo")
    public ResponseEntity<Map<String, Long>> obtenerAforo() {
        return ResponseEntity.ok(Map.of("aforo_actual", accesoService.obtenerAforoActual()));
    }
}
