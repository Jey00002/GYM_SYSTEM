package pe.gym.backend.modulo_finanzas.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_finanzas.entity.Membresia;
import pe.gym.backend.modulo_finanzas.entity.Pago;
import pe.gym.backend.modulo_finanzas.entity.PlanMembresia;
import pe.gym.backend.modulo_finanzas.repository.MembresiaRepository;
import pe.gym.backend.modulo_finanzas.repository.PagoRepository;
import pe.gym.backend.modulo_finanzas.repository.PlanMembresiaRepository;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.entity.MetodoPago;
import pe.gym.backend.modulo_finanzas.repository.MetodoPagoRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final MembresiaRepository membresiaRepository;
    private final PlanMembresiaRepository planRepository;
    private final SocioRepository socioRepository;
    private final MetodoPagoRepository metodoPagoRepository;

    public PagoService(PagoRepository pagoRepository, MembresiaRepository membresiaRepository,
                       PlanMembresiaRepository planRepository, SocioRepository socioRepository,
                       MetodoPagoRepository metodoPagoRepository) {
        this.pagoRepository = pagoRepository;
        this.membresiaRepository = membresiaRepository;
        this.planRepository = planRepository;
        this.socioRepository = socioRepository;
        this.metodoPagoRepository = metodoPagoRepository;
    }

    @Transactional
    public void registrarPagoSeguro(Long idSocio, Long idPlan, Long idMetodo, String transactionId) {
        // 1. Validar que el transactionId tenga formato válido (simulación de firma de pasarela)
        if (transactionId == null || !transactionId.startsWith("txn_") || transactionId.length() < 10) {
            throw new RuntimeException("Transacción inválida: origen no verificado");
        }

        // 2. Validar que este transactionId no haya sido usado antes (anti-replay)
        if (pagoRepository.existsByTransactionId(transactionId)) {
            throw new RuntimeException("Esta transacción ya fue procesada anteriormente");
        }

        // 3. Obtener entidades
        Socio socio = socioRepository.findById(idSocio)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        PlanMembresia plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));
        MetodoPago metodo = metodoPagoRepository.findById(idMetodo)
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        // 4. Crear membresía activa
        Membresia membresia = new Membresia();
        membresia.setSocio(socio);
        membresia.setPlanMembresia(plan);
        membresia.setFechaInicio(LocalDate.now());
        membresia.setFechaVencimiento(LocalDate.now().plusDays(plan.getDuracionDias()));
        membresia.setEstado("ACTIVA");
        membresiaRepository.save(membresia);

        // 5. Registrar pago con el transactionId validado
        Pago pago = new Pago();
        pago.setMembresia(membresia);
        pago.setMetodoPago(metodo);
        pago.setFechaPago(LocalDate.now());
        pago.setMonto(plan.getTarifa());
        pago.setTransactionId(transactionId); // Campo nuevo para seguridad
        pagoRepository.save(pago);
    }
}
