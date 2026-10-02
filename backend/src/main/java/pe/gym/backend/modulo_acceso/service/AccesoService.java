package pe.gym.backend.modulo_acceso.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_acceso.dto.AccesoRequest;
import pe.gym.backend.modulo_acceso.entity.Acceso;
import pe.gym.backend.modulo_acceso.entity.MetodoAcceso;
import pe.gym.backend.modulo_acceso.entity.ZonaAcceso;
import pe.gym.backend.modulo_acceso.repository.AccesoRepository;
import pe.gym.backend.modulo_acceso.repository.MetodoAccesoRepository;
import pe.gym.backend.modulo_acceso.repository.ZonaAccesoRepository;
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
    private final ZonaAccesoRepository zonaAccesoRepository;

    public AccesoService(AccesoRepository accesoRepository, SocioRepository socioRepository,
                         MembresiaRepository membresiaRepository, MetodoAccesoRepository metodoAccesoRepository,
                         ZonaAccesoRepository zonaAccesoRepository) {
        this.accesoRepository = accesoRepository;
        this.socioRepository = socioRepository;
        this.membresiaRepository = membresiaRepository;
        this.metodoAccesoRepository = metodoAccesoRepository;
        this.zonaAccesoRepository = zonaAccesoRepository;
    }

    @Transactional
    public Acceso registrarAcceso(AccesoRequest request) {
        Socio socio = socioRepository.findById(request.getIdSocio())
                .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        MetodoAcceso metodo = metodoAccesoRepository.findById(request.getIdMetodoAcceso())
                .orElseThrow(() -> new RuntimeException("Método de acceso inválido"));

        // Opcionalmente podemos identificar la zona de escaneo si el hardware la envía
        ZonaAcceso zonaSolicitada = null;
        if (request.getIdZona() != null) {
            zonaSolicitada = zonaAccesoRepository.findById(request.getIdZona()).orElse(null);
        }

        // RN-11: Verificar si ya tiene un ingreso sin salida
        Optional<Acceso> ingresoAbierto = accesoRepository.findBySocioIdAndHoraSalidaIsNull(socio.getId());
        
        if (ingresoAbierto.isPresent()) {
            // Registrar SALIDA
            Acceso acceso = ingresoAbierto.get();
            acceso.setHoraSalida(LocalTime.now());
            return accesoRepository.save(acceso);
        } else {
            // Intentar registrar INGRESO
            
            // RN-08: Validar membresía vigente
            List<Membresia> membresiasActivas = membresiaRepository.findBySocioIdAndEstado(socio.getId(), "ACTIVA");
            
            Acceso acceso = new Acceso();
            acceso.setSocio(socio);
            acceso.setMetodoAcceso(metodo);
            acceso.setFecha(LocalDate.now());
            acceso.setHoraIngreso(LocalTime.now());

            final ZonaAcceso finalZona = zonaSolicitada;
            
            boolean tieneAcceso = membresiasActivas.stream().anyMatch(m -> {
                boolean vigente = !m.getFechaVencimiento().isBefore(LocalDate.now());
                if (!vigente) return false;
                
                // Si el hardware NO envía idZona (modo fallback de recepción), solo se valida vigencia
                if (finalZona == null) return true;
                
                // Control de Acceso por Zonas: Full Access (ID=4) entra a todo. Si no, debe coincidir disciplina.
                Long idDisciplinaPlan = m.getPlanMembresia().getDisciplina().getId();
                Long idDisciplinaZona = finalZona.getDisciplina() != null ? finalZona.getDisciplina().getId() : null;
                
                return idDisciplinaPlan.equals(4L) || idDisciplinaPlan.equals(idDisciplinaZona);
            });

            if (!tieneAcceso) {
                acceso.setResultado("DENEGADO_RESTRICCION_ZONA"); 
            } else {
                acceso.setResultado("AUTORIZADO");
            }

            return accesoRepository.save(acceso);
        }
    }

    public long obtenerAforoActual() {
        return accesoRepository.countByFechaAndHoraSalidaIsNull(LocalDate.now());
    }
}
