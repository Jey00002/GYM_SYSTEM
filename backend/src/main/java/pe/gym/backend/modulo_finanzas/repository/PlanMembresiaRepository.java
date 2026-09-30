package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.PlanMembresia;

import java.util.List;

@Repository
public interface PlanMembresiaRepository extends JpaRepository<PlanMembresia, Long> {
    List<PlanMembresia> findByEstado(Boolean estado);
}
