package pe.gym.backend.modulo_entrenamiento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class RutinaRequest {
    @NotNull private Long idSocio;
    @NotNull private Long idEntrenador;
    @NotBlank private String nombreRutina;
    private List<EjercicioDetalle> ejercicios;

    @Data
    public static class EjercicioDetalle {
        @NotNull private Long idEjercicio;
        @NotNull private Integer series;
        @NotNull private Integer repeticiones;
    }
}
