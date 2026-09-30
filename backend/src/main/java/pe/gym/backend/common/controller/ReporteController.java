package pe.gym.backend.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.gym.backend.modulo_acceso.service.AccesoService;
import pe.gym.backend.modulo_finanzas.repository.MembresiaRepository;
import pe.gym.backend.modulo_finanzas.repository.PagoRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final MembresiaRepository membresiaRepository;
    private final PagoRepository pagoRepository;
    private final AccesoService accesoService;

    public ReporteController(MembresiaRepository membresiaRepository,
                             PagoRepository pagoRepository,
                             AccesoService accesoService) {
        this.membresiaRepository = membresiaRepository;
        this.pagoRepository = pagoRepository;
        this.accesoService = accesoService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<Map<String, Object>> dashboard() {
        long activos = membresiaRepository.countByEstado("ACTIVA");
        long morosos = membresiaRepository.countByEstado("MOROSO");
        long total = membresiaRepository.count();
        BigDecimal morosidad = total == 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(morosos * 100.0 / total).setScale(1, RoundingMode.HALF_UP);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ingresos_totales", pagoRepository.ingresosTotales());
        data.put("socios_activos", activos);
        data.put("morosidad_pct", morosidad);
        data.put("aforo_actual", accesoService.obtenerAforoActual());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/ingresos-mensuales")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> ingresosMensuales() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] fila : pagoRepository.ingresosPorMes()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("mes", String.valueOf(fila[0]));
            m.put("total", fila[1]);
            result.add(m);
        }
        Collections.reverse(result);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/membresias-estado")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> membresiasEstado() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] fila : membresiaRepository.conteoPorEstado()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("estado", String.valueOf(fila[0]));
            m.put("total", fila[1]);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/por-disciplina")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> ventasPorDisciplina() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] fila : pagoRepository.ventasPorDisciplina()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("nombre", String.valueOf(fila[0]));
            m.put("color", String.valueOf(fila[1]));
            m.put("ventas", fila[2]);
            m.put("ingreso_total", fila[3]);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }
}
