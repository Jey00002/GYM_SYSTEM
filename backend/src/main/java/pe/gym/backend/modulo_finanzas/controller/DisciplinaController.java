package pe.gym.backend.modulo_finanzas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.gym.backend.modulo_finanzas.entity.Disciplina;
import pe.gym.backend.modulo_finanzas.repository.DisciplinaRepository;

import java.util.List;

@RestController
@RequestMapping("/api/disciplinas")
public class DisciplinaController {

    private final DisciplinaRepository disciplinaRepository;

    public DisciplinaController(DisciplinaRepository disciplinaRepository) {
        this.disciplinaRepository = disciplinaRepository;
    }

    @GetMapping
    public ResponseEntity<List<Disciplina>> obtenerTodas() {
        return ResponseEntity.ok(disciplinaRepository.findAll());
    }
}
