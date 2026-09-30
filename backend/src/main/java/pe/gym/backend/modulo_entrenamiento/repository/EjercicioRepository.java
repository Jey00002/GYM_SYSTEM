package pe.gym.backend.modulo_entrenamiento.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_entrenamiento.entity.Ejercicio;

@Repository
public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {
}
