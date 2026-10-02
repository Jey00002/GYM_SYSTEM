package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.Membresia;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembresiaRepository extends JpaRepository<Membresia, Long> {
    List<Membresia> findBySocioIdAndEstado(Long socioId, String estado);
    List<Membresia> findBySocioId(Long socioId);
    List<Membresia> findByFechaVencimientoBeforeAndEstado(LocalDate fecha, String estado);
    List<Membresia> findByFechaVencimientoBetweenAndEstado(LocalDate inicio, LocalDate fin, String estado);
    long countByEstado(String estado);
    void deleteBySocioId(Long socioId);

    @Query(value = "SELECT estado, COUNT(*) FROM membresia GROUP BY estado", nativeQuery = true)
    List<Object[]> conteoPorEstado();
}
