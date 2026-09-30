package pe.gym.backend.modulo_acceso.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_acceso.entity.Acceso;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccesoRepository extends JpaRepository<Acceso, Long> {
    Optional<Acceso> findBySocioIdAndHoraSalidaIsNull(Long socioId);
    long countByFechaAndHoraSalidaIsNull(LocalDate fecha);
    List<Acceso> findByFecha(LocalDate fecha);
    List<Acceso> findBySocioId(Long socioId);
    void deleteBySocioId(Long socioId);
}
