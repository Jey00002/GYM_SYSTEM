package pe.gym.backend.modulo_entrenamiento.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_entrenamiento.dto.MedicionRequest;
import pe.gym.backend.modulo_entrenamiento.dto.RutinaRequest;
import pe.gym.backend.modulo_entrenamiento.entity.MedicionBiometrica;
import pe.gym.backend.modulo_entrenamiento.entity.Rutina;
import pe.gym.backend.modulo_entrenamiento.service.EntrenamientoService;

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
}
