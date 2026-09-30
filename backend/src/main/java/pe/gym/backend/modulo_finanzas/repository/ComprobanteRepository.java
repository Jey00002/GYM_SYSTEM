package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.Comprobante;

@Repository
public interface ComprobanteRepository extends JpaRepository<Comprobante, Long> {
    void deleteByPagoId(Long pagoId);
}
