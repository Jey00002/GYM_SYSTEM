package pe.gym.backend.modulo_seguridad.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistroRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo invalido")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Solo se permiten correos con el dominio @gmail.com")
    private String correo;

    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 6, message = "La contrasena debe tener al menos 6 caracteres")
    private String contrasena;

    @NotBlank(message = "El codigo de verificacion es obligatorio")
    private String codigoVerificacion;
}
