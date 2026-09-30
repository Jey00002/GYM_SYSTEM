package pe.gym.backend.modulo_finanzas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class SocioRequest {
    @NotBlank private String nombres;
    @NotBlank private String apellidos;
    @NotBlank private String dni;
    private String telefono;
    private LocalDate fechaNacimiento;
    @NotBlank @Email private String correo; // Para crear su usuario
}
