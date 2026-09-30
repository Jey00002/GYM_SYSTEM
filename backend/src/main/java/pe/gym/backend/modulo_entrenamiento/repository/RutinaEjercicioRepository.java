package pe.gym.backend.modulo_entrenamiento.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_entrenamiento.entity.RutinaEjercicio;

import java.util.List;

@Repository
public interface RutinaEjercicioRepository extends JpaRepository<RutinaEjercicio, Long> {
    List<RutinaEjercicio> findByRutinaId(Long rutinaId);
    void deleteByRutinaId(Long rutinaId);
}
