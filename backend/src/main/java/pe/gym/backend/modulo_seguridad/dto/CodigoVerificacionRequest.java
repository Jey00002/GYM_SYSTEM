package pe.gym.backend.modulo_seguridad.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CodigoVerificacionRequest {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo invalido")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Solo se permiten correos con el dominio @gmail.com")
    private String correo;
}
