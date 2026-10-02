package pe.gym.backend.modulo_entrenamiento.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_entrenamiento.dto.MedicionRequest;
import pe.gym.backend.modulo_entrenamiento.dto.RutinaRequest;
import pe.gym.backend.modulo_entrenamiento.entity.*;
import pe.gym.backend.modulo_entrenamiento.repository.*;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class EntrenamientoService {

    private final RutinaRepository rutinaRepository;
    private final RutinaEjercicioRepository rutinaEjercicioRepository;
    private final EjercicioRepository ejercicioRepository;
    private final MedicionBiometricaRepository medicionRepository;
    private final MetaObjetivoRepository metaRepository;
    private final SocioRepository socioRepository;
    private final EntrenadorRepository entrenadorRepository;

    public EntrenamientoService(RutinaRepository rutinaRepository, RutinaEjercicioRepository rutinaEjercicioRepository,
                                EjercicioRepository ejercicioRepository, MedicionBiometricaRepository medicionRepository,
                                MetaObjetivoRepository metaRepository, SocioRepository socioRepository,
                                EntrenadorRepository entrenadorRepository) {
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
        this.ejercicioRepository = ejercicioRepository;
        this.medicionRepository = medicionRepository;
        this.metaRepository = metaRepository;
        this.socioRepository = socioRepository;
        this.entrenadorRepository = entrenadorRepository;
    }

    @Transactional
    public Rutina crearRutina(RutinaRequest request) {
        // RN-14: Validar que tenga al menos 1 ejercicio
        if (request.getEjercicios() == null || request.getEjercicios().isEmpty()) {
            throw new RuntimeException("La rutina debe tener al menos 1 ejercicio (RN-14)");
        }

        Socio socio = socioRepository.findById(request.getIdSocio()).orElseThrow();
        Entrenador entrenador = entrenadorRepository.findById(request.getIdEntrenador()).orElseThrow();

        Rutina rutina = new Rutina();
        rutina.setSocio(socio);
        rutina.setEntrenador(entrenador); // RN-13
        rutina.setNombreRutina(request.getNombreRutina());
        rutina.setFechaAsignacion(LocalDate.now());
        rutina.setEstado("ACTIVA");
        rutinaRepository.save(rutina);

        for (RutinaRequest.EjercicioDetalle det : request.getEjercicios()) {
            Ejercicio ej = ejercicioRepository.findById(det.getIdEjercicio()).orElseThrow();
            RutinaEjercicio re = new RutinaEjercicio();
            re.setRutina(rutina);
            re.setEjercicio(ej);
            re.setSeries(det.getSeries());
            re.setRepeticiones(det.getRepeticiones());
            re.setCompletado(false);
            rutinaEjercicioRepository.save(re);
        }
        return rutina;
    }

    @Transactional
    public MedicionBiometrica registrarMedicion(MedicionRequest request) {
        Socio socio = socioRepository.findById(request.getIdSocio()).orElseThrow();

        MedicionBiometrica m = new MedicionBiometrica();
        m.setSocio(socio);
        m.setFechaMedicion(LocalDate.now());
        m.setPeso(request.getPeso());
        m.setTalla(request.getTalla());
        m.setPorcentajeGrasa(request.getPorcentajeGrasa());
        medicionRepository.save(m); // RN-16: Historial inmutable

        // RN-17: Verificar metas cumplidas
        List<MetaObjetivo> metasPendientes = metaRepository.findBySocioIdAndEstado(socio.getId(), "PENDIENTE");
        for (MetaObjetivo meta : metasPendientes) {
            if (meta.getTipoMeta().equals("PERDER_PESO") && request.getPeso().doubleValue() <= 75.0) { // Ejemplo simple
                 meta.setEstado("CUMPLIDA");
                 metaRepository.save(meta);
            }
        }
        return m;
    }
    
    @Transactional
    public List<Ejercicio> listarEjercicios() {
        return ejercicioRepository.findAll();
    }

    public void marcarEjercicioCompletado(Long idRutinaEjercicio) {
        RutinaEjercicio re = rutinaEjercicioRepository.findById(idRutinaEjercicio)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
        re.setCompletado(true); // RN-18
        rutinaEjercicioRepository.save(re);
    }
}
