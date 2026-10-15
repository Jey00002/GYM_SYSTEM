package pe.gym.backend.modulo_finanzas.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_finanzas.dto.PlanRequest;
import pe.gym.backend.modulo_finanzas.entity.Disciplina;
import pe.gym.backend.modulo_finanzas.entity.PlanMembresia;
import pe.gym.backend.modulo_finanzas.repository.DisciplinaRepository;
import pe.gym.backend.modulo_finanzas.repository.MembresiaRepository;
import pe.gym.backend.modulo_finanzas.repository.PlanMembresiaRepository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/planes")
public class PlanController {

    private final PlanMembresiaRepository planRepository;
    private final MembresiaRepository membresiaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final ObjectMapper objectMapper;

    public PlanController(PlanMembresiaRepository planRepository,
                          MembresiaRepository membresiaRepository,
                          DisciplinaRepository disciplinaRepository,
                          ObjectMapper objectMapper) {
        this.planRepository = planRepository;
        this.membresiaRepository = membresiaRepository;
        this.disciplinaRepository = disciplinaRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Lista solo los planes activos (visible en la página principal).
     */
    @GetMapping
    public ResponseEntity<List<PlanMembresia>> listarActivos() {
        return ResponseEntity.ok(planRepository.findByEstado(true));
    }

    /**
     * Lista todos los planes (activos e inactivos) para la gestión del Gerente.
     */
    @GetMapping("/todos")
    public ResponseEntity<List<PlanMembresia>> listarTodos() {
        return ResponseEntity.ok(planRepository.findAllByOrderByIdAsc());
    }

    /**
     * Busca un plan por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        return planRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crea un nuevo plan de membresía.
     */
    @PostMapping
    public ResponseEntity<?> crearPlan(@Valid @RequestBody PlanRequest request) {
        try {
            PlanMembresia plan = new PlanMembresia();
            mapearDatos(plan, request);
            PlanMembresia guardado = planRepository.save(plan);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al crear el plan: " + e.getMessage()));
        }
    }

    /**
     * Actualiza un plan existente (precio, características, badge, color, etc.).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPlan(@PathVariable Long id, @Valid @RequestBody PlanRequest request) {
        return planRepository.findById(id).map(plan -> {
            try {
                mapearDatos(plan, request);
                PlanMembresia actualizado = planRepository.save(plan);
                return ResponseEntity.ok(actualizado);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Error al actualizar el plan: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cambia rápidamente el estado (activo / inactivo) de un plan.
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> alternarEstado(@PathVariable Long id) {
        return planRepository.findById(id).map(plan -> {
            plan.setEstado(!Boolean.TRUE.equals(plan.getEstado()));
            planRepository.save(plan);
            return ResponseEntity.ok(Map.of(
                    "id", plan.getId(),
                    "estado", plan.getEstado(),
                    "mensaje", plan.getEstado() ? "Plan activado correctamente" : "Plan desactivado correctamente"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Elimina un plan según la regla de negocio RN-06:
     * No eliminar Plan_Membresia si tiene Membresias activas (solo desactivar).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPlan(@PathVariable Long id) {
        return planRepository.findById(id).map(plan -> {
            // Regla RN-06: Verificar si tiene membresías activas
            if (membresiaRepository.existsByPlanMembresiaIdAndEstado(id, "ACTIVA")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "RN-06: No se puede eliminar el plan porque tiene membresías activas asociadas. Debe desactivarlo en su lugar."
                ));
            }

            // Si tiene registros históricos de membresías pasadas, no eliminamos físicamente para mantener integridad
            if (membresiaRepository.countByPlanMembresiaId(id) > 0) {
                plan.setEstado(false);
                planRepository.save(plan);
                return ResponseEntity.ok(Map.of(
                        "mensaje", "El plan tiene historial de membresías previas. Se desactivó automáticamente para proteger la integridad histórica."
                ));
            }

            // Si no tiene ninguna membresía vinculada, se puede eliminar físicamente
            planRepository.delete(plan);
            return ResponseEntity.ok(Map.of("mensaje", "Plan eliminado exitosamente"));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void mapearDatos(PlanMembresia plan, PlanRequest request) {
        plan.setNombrePlan(request.getNombrePlan().trim());
        plan.setDuracionDias(request.getDuracionDias());
        plan.setTarifa(request.getTarifa());
        plan.setEstado(request.getEstado() != null ? request.getEstado() : true);

        if (request.getBadge() != null && !request.getBadge().isBlank()) {
            plan.setBadge(request.getBadge().trim());
        }

        if (request.getColor() != null && !request.getColor().isBlank()) {
            plan.setColor(request.getColor().trim());
        }

        if (request.getDescripcion() != null) {
            plan.setDescripcion(request.getDescripcion().trim());
        }

        // Manejo de características / beneficios
        if (request.getBeneficios() != null && !request.getBeneficios().isEmpty()) {
            try {
                plan.setBeneficios(objectMapper.writeValueAsString(request.getBeneficios()));
            } catch (JsonProcessingException e) {
                plan.setBeneficios(String.join("\n", request.getBeneficios()));
            }
        } else if (request.getBeneficiosTexto() != null) {
            String texto = request.getBeneficiosTexto().trim();
            if (texto.startsWith("[") && texto.endsWith("]")) {
                plan.setBeneficios(texto);
            } else {
                List<String> lineas = Arrays.stream(texto.split("\n"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();
                try {
                    plan.setBeneficios(objectMapper.writeValueAsString(lineas));
                } catch (JsonProcessingException e) {
                    plan.setBeneficios(texto);
                }
            }
        }

        // Asignación de disciplina
        if (request.getIdDisciplina() != null) {
            disciplinaRepository.findById(request.getIdDisciplina()).ifPresent(plan::setDisciplina);
        } else if (plan.getDisciplina() == null) {
            // Asigna la primera disciplina por defecto si no tiene
            disciplinaRepository.findAll().stream().findFirst().ifPresent(plan::setDisciplina);
        }
    }
}
