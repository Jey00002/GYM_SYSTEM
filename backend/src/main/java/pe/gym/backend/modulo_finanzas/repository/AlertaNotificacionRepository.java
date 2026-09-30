package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.AlertaNotificacion;

@Repository
public interface AlertaNotificacionRepository extends JpaRepository<AlertaNotificacion, Long> {
    boolean existsByMembresiaIdAndTipoAlerta(Long membresiaId, String tipoAlerta);
}
