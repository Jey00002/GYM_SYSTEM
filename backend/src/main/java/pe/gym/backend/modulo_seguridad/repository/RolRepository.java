package pe.gym.backend.modulo_seguridad.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_seguridad.entity.Rol;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombreRol(String nombreRol);
}
