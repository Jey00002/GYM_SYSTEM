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

    private final pe.gym.backend.modulo_seguridad.repository.UsuarioRepository usuarioRepository;

    public EntrenamientoService(RutinaRepository rutinaRepository, RutinaEjercicioRepository rutinaEjercicioRepository,
                                EjercicioRepository ejercicioRepository, MedicionBiometricaRepository medicionRepository,
                                MetaObjetivoRepository metaRepository, SocioRepository socioRepository,
                                EntrenadorRepository entrenadorRepository,
                                pe.gym.backend.modulo_seguridad.repository.UsuarioRepository usuarioRepository) {
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
        this.ejercicioRepository = ejercicioRepository;
        this.medicionRepository = medicionRepository;
        this.metaRepository = metaRepository;
        this.socioRepository = socioRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Rutina crearRutina(RutinaRequest request) {
        // RN-14: Validar que tenga al menos 1 ejercicio
        if (request.getEjercicios() == null || request.getEjercicios().isEmpty()) {
            throw new RuntimeException("La rutina debe tener al menos 1 ejercicio (RN-14)");
        }

        Socio socio = socioRepository.findById(request.getIdSocio())
                .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        Entrenador entrenador = entrenadorRepository.findById(request.getIdEntrenador())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));

        // Desactivar cualquier rutina previa activa del socio para evitar conflictos
        List<Rutina> previas = rutinaRepository.findAllBySocioIdAndEstado(socio.getId(), "ACTIVA");
        for (Rutina p : previas) {
            p.setEstado("INACTIVA");
            rutinaRepository.save(p);
        }

        Rutina rutina = new Rutina();
        rutina.setSocio(socio);
        rutina.setEntrenador(entrenador); // RN-13
        rutina.setNombreRutina(request.getNombreRutina());
        rutina.setFechaAsignacion(LocalDate.now());
        rutina.setEstado("ACTIVA");
        rutinaRepository.save(rutina);

        for (RutinaRequest.EjercicioDetalle det : request.getEjercicios()) {
            Ejercicio ej = ejercicioRepository.findById(det.getIdEjercicio())
                    .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));
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

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> obtenerRutinaActivaSocio(Long socioId) {
        return rutinaRepository.findFirstBySocioIdAndEstadoOrderByIdDesc(socioId, "ACTIVA")
                .map(this::mapearRutinaDetalle)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> obtenerHistorialRutinas(Long socioId) {
        java.util.List<java.util.Map<String, Object>> lista = new java.util.ArrayList<>();
        for (Rutina r : rutinaRepository.findBySocioIdOrderByIdDesc(socioId)) {
            lista.add(mapearRutinaDetalle(r));
        }
        return lista;
    }

    private java.util.Map<String, Object> mapearRutinaDetalle(Rutina r) {
        java.util.Map<String, Object> rm = new java.util.LinkedHashMap<>();
        rm.put("id", r.getId());
        rm.put("nombre", r.getNombreRutina());
        rm.put("nombreRutina", r.getNombreRutina());
        rm.put("fechaAsignacion", r.getFechaAsignacion() != null ? r.getFechaAsignacion().toString() : "");
        rm.put("estado", r.getEstado());

        if (r.getEntrenador() != null) {
            java.util.Map<String, Object> ent = new java.util.LinkedHashMap<>();
            ent.put("id", r.getEntrenador().getId());
            String nom = r.getEntrenador().getNombres() != null ? r.getEntrenador().getNombres() : "Entrenador";
            if (r.getEntrenador().getApellidos() != null) {
                nom += " " + r.getEntrenador().getApellidos();
            }
            ent.put("nombres", nom);
            ent.put("especialidad", r.getEntrenador().getEspecialidad() != null ? r.getEntrenador().getEspecialidad() : "Instructor");
            rm.put("entrenador", ent);
        }

        java.util.List<java.util.Map<String, Object>> ejs = new java.util.ArrayList<>();
        for (RutinaEjercicio re : rutinaEjercicioRepository.findByRutinaId(r.getId())) {
            java.util.Map<String, Object> ej = new java.util.LinkedHashMap<>();
            ej.put("id", re.getId());
            ej.put("series", re.getSeries());
            ej.put("repeticiones", re.getRepeticiones());
            ej.put("completado", re.getCompletado());

            Ejercicio ejEntity = re.getEjercicio();
            if (ejEntity != null) {
                ej.put("nombre", ejEntity.getNombreEjercicio());
                ej.put("nombreEjercicio", ejEntity.getNombreEjercicio());
                ej.put("descripcion", ejEntity.getDescripcion() != null ? ejEntity.getDescripcion() : "");
                ej.put("grupoMuscular", ejEntity.getGrupoMuscular() != null ? ejEntity.getGrupoMuscular() : "");
                ej.put("urlGif", ejEntity.getUrlGif() != null ? ejEntity.getUrlGif() : "");

                java.util.Map<String, Object> sub = new java.util.LinkedHashMap<>();
                sub.put("id", ejEntity.getId());
                sub.put("nombreEjercicio", ejEntity.getNombreEjercicio());
                sub.put("descripcion", ejEntity.getDescripcion() != null ? ejEntity.getDescripcion() : "");
                sub.put("grupoMuscular", ejEntity.getGrupoMuscular() != null ? ejEntity.getGrupoMuscular() : "");
                sub.put("urlGif", ejEntity.getUrlGif() != null ? ejEntity.getUrlGif() : "");
                ej.put("ejercicio", sub);
            }
            ejs.add(ej);
        }
        rm.put("ejercicios", ejs);
        return rm;
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> obtenerPerfilEntrenador(String correo) {
        java.util.Map<String, Object> out = new java.util.LinkedHashMap<>();
        if (correo != null) {
            usuarioRepository.findByCorreo(correo).ifPresent(u -> {
                out.put("idUsuario", u.getId());
                out.put("correo", u.getCorreo());
                entrenadorRepository.findByUsuarioId(u.getId()).ifPresent(e -> {
                    out.put("idEntrenador", e.getId());
                    out.put("nombres", e.getNombres());
                    out.put("apellidos", e.getApellidos());
                    out.put("dni", e.getDni());
                    out.put("especialidad", e.getEspecialidad());
                });
            });
        }
        if (!out.containsKey("idEntrenador")) {
            // Si el usuario logueado no tiene entrenador asociado o es admin, tomamos el primer entrenador
            entrenadorRepository.findAll().stream().findFirst().ifPresent(e -> {
                out.put("idEntrenador", e.getId());
                out.put("nombres", e.getNombres());
                out.put("apellidos", e.getApellidos());
                out.put("dni", e.getDni());
                out.put("especialidad", e.getEspecialidad());
            });
        }
        return out;
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

    @Transactional
    public Ejercicio agregarEjercicio(Ejercicio ejercicio) {
        return ejercicioRepository.save(ejercicio);
    }

    @Transactional(readOnly = true)
    public List<MedicionBiometrica> obtenerMedicionesSocio(Long socioId) {
        return medicionRepository.findBySocioIdOrderByFechaMedicionDesc(socioId);
    }

    public void marcarEjercicioCompletado(Long idRutinaEjercicio) {
        RutinaEjercicio re = rutinaEjercicioRepository.findById(idRutinaEjercicio)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
        re.setCompletado(true); // RN-18
        rutinaEjercicioRepository.save(re);
    }
}
