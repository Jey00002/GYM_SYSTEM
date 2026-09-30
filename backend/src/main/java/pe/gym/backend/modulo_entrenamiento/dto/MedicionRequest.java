package pe.gym.backend.modulo_entrenamiento.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MedicionRequest {
    @NotNull private Long idSocio;
    @NotNull @DecimalMin("0.1") private BigDecimal peso; // RN-15
    @NotNull @DecimalMin("0.1") private BigDecimal talla; // RN-15
    @NotNull @DecimalMin("0.0") private BigDecimal porcentajeGrasa;
}
