package pe.gym.backend.modulo_entrenamiento.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.gym.backend.modulo_entrenamiento.entity.MedicionBiometrica;

import java.util.List;

@Repository
public interface MedicionBiometricaRepository extends JpaRepository<MedicionBiometrica, Long> {
    List<MedicionBiometrica> findBySocioIdOrderByFechaMedicionDesc(Long socioId);
    void deleteBySocioId(Long socioId);
}
