package pe.gym.backend.modulo_entrenamiento.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_entrenamiento.entity.MetaObjetivo;

import java.util.List;

@Repository
public interface MetaObjetivoRepository extends JpaRepository<MetaObjetivo, Long> {
    List<MetaObjetivo> findBySocioIdAndEstado(Long socioId, String estado);
}
