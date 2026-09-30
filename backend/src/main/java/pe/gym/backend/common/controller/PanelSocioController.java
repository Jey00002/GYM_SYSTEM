package pe.gym.backend.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.gym.backend.modulo_acceso.entity.Acceso;
import pe.gym.backend.modulo_acceso.repository.AccesoRepository;
import pe.gym.backend.modulo_entrenamiento.entity.MedicionBiometrica;
import pe.gym.backend.modulo_entrenamiento.entity.Rutina;
import pe.gym.backend.modulo_entrenamiento.entity.RutinaEjercicio;
import pe.gym.backend.modulo_entrenamiento.repository.MedicionBiometricaRepository;
import pe.gym.backend.modulo_entrenamiento.repository.RutinaEjercicioRepository;
import pe.gym.backend.modulo_entrenamiento.repository.RutinaRepository;
import pe.gym.backend.modulo_finanzas.entity.Membresia;
import pe.gym.backend.modulo_finanzas.entity.Pago;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.MembresiaRepository;
import pe.gym.backend.modulo_finanzas.repository.PagoRepository;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/panel-socio")
public class PanelSocioController {

    private final UsuarioRepository usuarioRepository;
    private final SocioRepository socioRepository;
    private final MembresiaRepository membresiaRepository;
    private final MedicionBiometricaRepository medicionRepository;
    private final RutinaRepository rutinaRepository;
    private final RutinaEjercicioRepository rutinaEjercicioRepository;
    private final PagoRepository pagoRepository;
    private final AccesoRepository accesoRepository;

    public PanelSocioController(UsuarioRepository usuarioRepository, SocioRepository socioRepository,
                                MembresiaRepository membresiaRepository, MedicionBiometricaRepository medicionRepository,
                                RutinaRepository rutinaRepository, RutinaEjercicioRepository rutinaEjercicioRepository,
                                PagoRepository pagoRepository, AccesoRepository accesoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.socioRepository = socioRepository;
        this.membresiaRepository = membresiaRepository;
        this.medicionRepository = medicionRepository;
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
        this.pagoRepository = pagoRepository;
        this.accesoRepository = accesoRepository;
    }

    @GetMapping("/datos")
    public ResponseEntity<Map<String, Object>> datos(Principal principal) {
        Usuario usuario = usuarioRepository.findByCorreo(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Socio socio = socioRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Tu usuario no tiene perfil de socio"));

        Map<String, Object> out = new LinkedHashMap<>();
        Map<String, Object> ms = new LinkedHashMap<>();
        ms.put("id", socio.getId());
        ms.put("nombres", socio.getNombres());
        ms.put("apellidos", socio.getApellidos());
        ms.put("dni", socio.getDni());
        out.put("socio", ms);

        List<Membresia> membresias = membresiaRepository.findBySocioId(socio.getId());
        if (!membresias.isEmpty()) {
            Membresia m = membresias.stream().max(Comparator.comparing(Membresia::getFechaVencimiento)).get();
            Map<String, Object> mm = new LinkedHashMap<>();
            mm.put("estado", m.getEstado());
            mm.put("fechaInicio", m.getFechaInicio().toString());
            mm.put("fechaVencimiento", m.getFechaVencimiento().toString());
            mm.put("plan", m.getPlanMembresia().getNombrePlan());
            out.put("membresia", mm);
        } else {
            out.put("membresia", null);
        }

        List<Map<String, Object>> meds = new ArrayList<>();
        List<MedicionBiometrica> lista = medicionRepository.findBySocioIdOrderByFechaMedicionDesc(socio.getId());
        Collections.reverse(lista);
        for (MedicionBiometrica med : lista) {
            Map<String, Object> md = new LinkedHashMap<>();
            md.put("fecha", med.getFechaMedicion() == null ? "" : med.getFechaMedicion().toString());
            md.put("peso", med.getPeso());
            md.put("talla", med.getTalla());
            md.put("grasa", med.getPorcentajeGrasa());
            meds.add(md);
        }
        out.put("mediciones", meds);

        Optional<Rutina> rutina = rutinaRepository.findBySocioIdAndEstado(socio.getId(), "ACTIVA");
        if (rutina.isPresent()) {
            Rutina r = rutina.get();
            Map<String, Object> rm = new LinkedHashMap<>();
            rm.put("nombre", r.getNombreRutina());
            List<Map<String, Object>> ejs = new ArrayList<>();
            for (RutinaEjercicio re : rutinaEjercicioRepository.findByRutinaId(r.getId())) {
                Map<String, Object> ej = new LinkedHashMap<>();
                ej.put("id", re.getId());
                ej.put("nombre", re.getEjercicio().getNombreEjercicio());
                ej.put("series", re.getSeries());
                ej.put("repeticiones", re.getRepeticiones());
                ej.put("completado", re.getCompletado());
                ejs.add(ej);
            }
            rm.put("ejercicios", ejs);
            out.put("rutina", rm);
        } else {
            out.put("rutina", null);
        }

        List<Map<String, Object>> pagos = new ArrayList<>();
        for (Membresia m : membresias) {
            for (Pago p : pagoRepository.findByMembresiaId(m.getId())) {
                Map<String, Object> pm = new LinkedHashMap<>();
                pm.put("fecha", p.getFechaPago() == null ? "" : p.getFechaPago().toString());
                pm.put("monto", p.getMonto());
                pm.put("metodo", p.getMetodoPago().getNombreMetodo());
                pm.put("plan", m.getPlanMembresia().getNombrePlan());
                pagos.add(pm);
            }
        }
        pagos.sort((a, b) -> ((String) b.get("fecha")).compareTo((String) a.get("fecha")));
        out.put("pagos", pagos);

        List<Map<String, Object>> accs = new ArrayList<>();
        List<Acceso> la = accesoRepository.findBySocioId(socio.getId());
        la.sort((a, b) -> (b.getFecha() == null ? "" : b.getFecha().toString())
                .compareTo(a.getFecha() == null ? "" : a.getFecha().toString()));
        for (Acceso a : la) {
            Map<String, Object> am = new LinkedHashMap<>();
            am.put("fecha", a.getFecha() == null ? "" : a.getFecha().toString());
            am.put("horaIngreso", a.getHoraIngreso() == null ? null : a.getHoraIngreso().toString());
            am.put("resultado", a.getResultado());
            accs.add(am);
        }
        out.put("accesos", accs);

        return ResponseEntity.ok(out);
    }
}
