package pe.gym.backend.modulo_acceso.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_acceso.dto.AccesoRequest;
import pe.gym.backend.modulo_acceso.entity.Acceso;
import pe.gym.backend.modulo_acceso.entity.MetodoAcceso;
import pe.gym.backend.modulo_acceso.repository.AccesoRepository;
import pe.gym.backend.modulo_acceso.repository.MetodoAccesoRepository;
import pe.gym.backend.modulo_finanzas.entity.Membresia;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.MembresiaRepository;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AccesoService {

    private final AccesoRepository accesoRepository;
    private final SocioRepository socioRepository;
    private final MembresiaRepository membresiaRepository;
    private final MetodoAccesoRepository metodoAccesoRepository;

    public AccesoService(AccesoRepository accesoRepository, SocioRepository socioRepository,
                         MembresiaRepository membresiaRepository, MetodoAccesoRepository metodoAccesoRepository) {
        this.accesoRepository = accesoRepository;
        this.socioRepository = socioRepository;
        this.membresiaRepository = membresiaRepository;
        this.metodoAccesoRepository = metodoAccesoRepository;
    }

    @Transactional
    public Acceso registrarAcceso(AccesoRequest request) {
        Socio socio = socioRepository.findById(request.getIdSocio())
                .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        MetodoAcceso metodo = metodoAccesoRepository.findById(request.getIdMetodoAcceso())
                .orElseThrow(() -> new RuntimeException("Método de acceso inválido"));

        // RN-11: Verificar si ya tiene un ingreso sin salida
        Optional<Acceso> ingresoAbierto = accesoRepository.findBySocioIdAndHoraSalidaIsNull(socio.getId());
        
        if (ingresoAbierto.isPresent()) {
            // Registrar SALIDA
            Acceso acceso = ingresoAbierto.get();
            acceso.setHoraSalida(LocalTime.now());
            return accesoRepository.save(acceso);
        } else {
            // Intentar registrar INGRESO
            
            // RN-08: Validar membresía vigente (puede tener varias por área)
            List<Membresia> membresiasActivas = membresiaRepository.findBySocioIdAndEstado(socio.getId(), "ACTIVA");
            
            Acceso acceso = new Acceso();
            acceso.setSocio(socio);
            acceso.setMetodoAcceso(metodo);
            acceso.setFecha(LocalDate.now());
            acceso.setHoraIngreso(LocalTime.now());

            boolean tieneAcceso = membresiasActivas.stream()
                    .anyMatch(m -> !m.getFechaVencimiento().isBefore(LocalDate.now()));

            if (!tieneAcceso) {
                acceso.setResultado("DENEGADO"); // RN-08
                // RN-10: Aquí se podría disparar una alerta a recepción
            } else {
                acceso.setResultado("AUTORIZADO");
            }

            // RN-09: Guardar intento (éxito o fallo)
            return accesoRepository.save(acceso);
        }
    }

    // RN-12: Aforo en tiempo real
    public long obtenerAforoActual() {
        return accesoRepository.countByFechaAndHoraSalidaIsNull(LocalDate.now());
    }
}
