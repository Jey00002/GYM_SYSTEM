package pe.gym.backend.modulo_finanzas.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import pe.gym.backend.modulo_finanzas.entity.AlertaNotificacion;
import pe.gym.backend.modulo_finanzas.entity.Membresia;
import pe.gym.backend.modulo_finanzas.repository.AlertaNotificacionRepository;
import pe.gym.backend.modulo_finanzas.repository.MembresiaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TareasProgramadas {

    private final MembresiaRepository membresiaRepository;
    private final AlertaNotificacionRepository alertaRepository;

    public TareasProgramadas(MembresiaRepository membresiaRepository, AlertaNotificacionRepository alertaRepository) {
        this.membresiaRepository = membresiaRepository;
        this.alertaRepository = alertaRepository;
    }

    // RN-01: Alerta si faltan <= 3 días (Se ejecuta cada día a las 8 AM)
    @Scheduled(cron = "0 0 8 * * ?")
    public void verificarVencimientosProximos() {
        LocalDate hoy = LocalDate.now();
        LocalDate en3Dias = hoy.plusDays(3);
        
        List<Membresia> porVencer = membresiaRepository.findByFechaVencimientoBetweenAndEstado(hoy, en3Dias, "ACTIVA");
        
        for (Membresia m : porVencer) {
            // Evitar duplicados
            if (!alertaRepository.existsByMembresiaIdAndTipoAlerta(m.getId(), "VENCIMIENTO_PROXIMO")) {
                AlertaNotificacion alerta = new AlertaNotificacion();
                alerta.setMembresia(m);
                alerta.setTipoAlerta("VENCIMIENTO_PROXIMO");
                alerta.setFechaEnvio(LocalDateTime.now());
                alerta.setEstadoEnvio("PENDIENTE");
                alertaRepository.save(alerta);
                System.out.println("🔔 Alerta generada para socio ID: " + m.getSocio().getId());
            }
        }
    }

    // RN-02: Marcar como MOROSO si fecha_actual > fecha_vencimiento (Se ejecuta cada día a las 12 AM)
    @Scheduled(cron = "0 0 0 * * ?")
    public void marcarMorosos() {
        LocalDate hoy = LocalDate.now();
        List<Membresia> vencidas = membresiaRepository.findByFechaVencimientoBeforeAndEstado(hoy, "ACTIVA");
        
        for (Membresia m : vencidas) {
            m.setEstado("MOROSO");
            membresiaRepository.save(m);
            System.out.println("⚠️ Socio ID " + m.getSocio().getId() + " marcado como MOROSO");
        }
    }
}
