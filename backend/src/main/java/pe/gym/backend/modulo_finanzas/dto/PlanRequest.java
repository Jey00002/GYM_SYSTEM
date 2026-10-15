package pe.gym.backend.modulo_finanzas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PlanRequest {
    @NotBlank(message = "El nombre del plan no puede estar vacío")
    private String nombrePlan;

    @NotNull(message = "La duración en días es requerida")
    @Min(value = 1, message = "La duración debe ser al menos 1 día")
    private Integer duracionDias;

    @NotNull(message = "La tarifa es requerida")
    @DecimalMin(value = "0.0", inclusive = true, message = "La tarifa no puede ser negativa")
    private BigDecimal tarifa;

    private Boolean estado;

    private Long idDisciplina;

    private String badge;

    private String color;

    private String descripcion;

    // Puede recibir una lista de strings con las características o beneficios
    private List<String> beneficios;

    // O un string directo ya formateado
    private String beneficiosTexto;
}
