package pe.gym.backend.modulo_acceso.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_acceso.entity.MetodoAcceso;

import java.util.Optional;

@Repository
public interface MetodoAccesoRepository extends JpaRepository<MetodoAcceso, Long> {
    Optional<MetodoAcceso> findByNombreMetodo(String nombreMetodo);
}
