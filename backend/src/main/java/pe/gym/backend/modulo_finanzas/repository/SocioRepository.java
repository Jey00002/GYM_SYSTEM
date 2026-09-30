package pe.gym.backend.modulo_finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_finanzas.entity.Socio;

import java.util.List;
import java.util.Optional;

@Repository
public interface SocioRepository extends JpaRepository<Socio, Long> {
    Optional<Socio> findByDni(String dni);
    Optional<Socio> findByUsuarioId(Long usuarioId);

    @Query(value = "SELECT s.id_socio, CONCAT(s.nombres, ' ', s.apellidos), s.dni, s.telefono, COALESCE(m.estado, 'SIN_MEMBRESIA'), m.fecha_vencimiento FROM socio s LEFT JOIN membresia m ON m.id_socio = s.id_socio ORDER BY s.id_socio", nativeQuery = true)
    List<Object[]> resumenSocios();
}
