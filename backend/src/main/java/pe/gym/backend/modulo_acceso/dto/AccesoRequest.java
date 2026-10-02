package pe.gym.backend.modulo_acceso.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccesoRequest {
    @NotNull private Long idSocio;
    @NotNull private Long idMetodoAcceso;
    private Long idZona; // 1=QR, 2=DNI, 3=BIOMETRICO
}
