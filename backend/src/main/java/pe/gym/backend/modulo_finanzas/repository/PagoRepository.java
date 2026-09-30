package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.Pago;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByMembresiaId(Long membresiaId);
    void deleteByMembresiaId(Long membresiaId);
    boolean existsByTransactionId(String transactionId);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p")
    BigDecimal ingresosTotales();

    @Query(value = "SELECT DATE_FORMAT(p.fecha_pago, '%Y-%m') as mes, SUM(p.monto) as total FROM pago p GROUP BY mes ORDER BY mes DESC LIMIT 12", nativeQuery = true)
    List<Object[]> ingresosPorMes();

    @Query(value = "SELECT nombre, color, ventas, ingreso_total FROM v_ventas_por_disciplina", nativeQuery = true)
    List<Object[]> ventasPorDisciplina();
}
