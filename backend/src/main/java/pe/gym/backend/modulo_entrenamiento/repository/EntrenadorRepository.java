package pe.gym.backend.modulo_entrenamiento.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_entrenamiento.entity.Entrenador;

import java.util.Optional;

@Repository
public interface EntrenadorRepository extends JpaRepository<Entrenador, Long> {
    Optional<Entrenador> findByUsuarioId(Long usuarioId);
}
