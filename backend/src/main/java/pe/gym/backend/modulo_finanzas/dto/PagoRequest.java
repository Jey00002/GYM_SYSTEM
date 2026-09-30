package pe.gym.backend.modulo_finanzas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PagoRequest {
    @NotNull private Long idSocio;
    @NotNull private Long idPlan;
    @NotNull private Long idMetodoPago;
    @NotNull private BigDecimal monto;
}
