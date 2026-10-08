package pe.gym.backend.modulo_entrenamiento.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_entrenamiento.dto.MedicionRequest;
import pe.gym.backend.modulo_entrenamiento.dto.RutinaRequest;
import pe.gym.backend.modulo_entrenamiento.entity.MedicionBiometrica;
import pe.gym.backend.modulo_entrenamiento.entity.Rutina;
import pe.gym.backend.modulo_entrenamiento.entity.Ejercicio;
import pe.gym.backend.modulo_entrenamiento.service.EntrenamientoService;

import java.util.List;

@RestController
@RequestMapping("/api/entrenamiento")
public class EntrenamientoController {

    private final EntrenamientoService entrenamientoService;

    public EntrenamientoController(EntrenamientoService entrenamientoService) {
        this.entrenamientoService = entrenamientoService;
    }

    @PostMapping("/rutinas")
    public ResponseEntity<Rutina> crearRutina(@Valid @RequestBody RutinaRequest request) {
        return ResponseEntity.ok(entrenamientoService.crearRutina(request));
    }

    @PostMapping("/mediciones")
    public ResponseEntity<MedicionBiometrica> registrarMedicion(@Valid @RequestBody MedicionRequest request) {
        return ResponseEntity.ok(entrenamientoService.registrarMedicion(request));
    }
    
    @PutMapping("/ejercicios/{id}/completar")
    public ResponseEntity<String> completarEjercicio(@PathVariable Long id) {
        entrenamientoService.marcarEjercicioCompletado(id);
        return ResponseEntity.ok("Ejercicio marcado como completado");
    }

    @GetMapping("/ejercicios")
    public ResponseEntity<List<Ejercicio>> listarEjercicios() {
        return ResponseEntity.ok(entrenamientoService.listarEjercicios());
    }

    @PostMapping("/ejercicios")
    public ResponseEntity<Ejercicio> crearEjercicio(@RequestBody Ejercicio ejercicio) {
        return ResponseEntity.ok(entrenamientoService.agregarEjercicio(ejercicio));
    }

    @GetMapping("/perfil-entrenador")
    public ResponseEntity<java.util.Map<String, Object>> perfilEntrenador(java.security.Principal principal) {
        String correo = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(entrenamientoService.obtenerPerfilEntrenador(correo));
    }

    @GetMapping("/socio/{socioId}/rutina-activa")
    public ResponseEntity<?> obtenerRutinaActiva(@PathVariable Long socioId) {
        java.util.Map<String, Object> rutina = entrenamientoService.obtenerRutinaActivaSocio(socioId);
        if (rutina == null) {
            return ResponseEntity.ok(java.util.Map.of("mensaje", "Sin rutina activa"));
        }
        return ResponseEntity.ok(rutina);
    }

    @GetMapping("/socio/{socioId}/historial-rutinas")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> historialRutinas(@PathVariable Long socioId) {
        return ResponseEntity.ok(entrenamientoService.obtenerHistorialRutinas(socioId));
    }

    @GetMapping("/socio/{socioId}/mediciones")
    public ResponseEntity<List<MedicionBiometrica>> listarMedicionesSocio(@PathVariable Long socioId) {
        return ResponseEntity.ok(entrenamientoService.obtenerMedicionesSocio(socioId));
    }
}
