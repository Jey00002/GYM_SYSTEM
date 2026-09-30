package pe.gym.backend.modulo_finanzas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.gym.backend.modulo_finanzas.entity.PlanMembresia;
import pe.gym.backend.modulo_finanzas.repository.PlanMembresiaRepository;

import java.util.List;

@RestController
@RequestMapping("/api/planes")
public class PlanController {

    private final PlanMembresiaRepository planRepository;

    public PlanController(PlanMembresiaRepository planRepository) {
        this.planRepository = planRepository;
    }

    @GetMapping
    public ResponseEntity<List<PlanMembresia>> listarActivos() {
        return ResponseEntity.ok(planRepository.findByEstado(true));
    }
}
