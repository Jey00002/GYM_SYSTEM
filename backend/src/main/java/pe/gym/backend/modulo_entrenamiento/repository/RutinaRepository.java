package pe.gym.backend.modulo_entrenamiento.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_entrenamiento.entity.Rutina;

import java.util.List;
import java.util.Optional;

@Repository
public interface RutinaRepository extends JpaRepository<Rutina, Long> {
    Optional<Rutina> findBySocioIdAndEstado(Long socioId, String estado);
    List<Rutina> findBySocioId(Long socioId);
    void deleteBySocioId(Long socioId);
}
