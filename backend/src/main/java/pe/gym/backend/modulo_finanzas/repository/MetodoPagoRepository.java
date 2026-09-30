package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.MetodoPago;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {
}
