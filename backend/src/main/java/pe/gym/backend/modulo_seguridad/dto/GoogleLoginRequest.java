package pe.gym.backend.modulo_seguridad.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank @Email private String correo;
    private String nombre;
}
