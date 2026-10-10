package pe.gym.backend.modulo_seguridad.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.gym.backend.modulo_seguridad.entity.CodigoVerificacion;
import java.util.Optional;

public interface CodigoVerificacionRepository extends JpaRepository<CodigoVerificacion, Long> {
    Optional<CodigoVerificacion> findByCorreoAndCodigo(String correo, String codigo);
    void deleteByCorreo(String correo);
}
