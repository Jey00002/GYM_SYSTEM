package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.Disciplina;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
}
