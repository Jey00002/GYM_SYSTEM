package pe.gym.backend.modulo_acceso.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.gym.backend.modulo_acceso.entity.ZonaAcceso;

public interface ZonaAccesoRepository extends JpaRepository<ZonaAcceso, Long> {
}
