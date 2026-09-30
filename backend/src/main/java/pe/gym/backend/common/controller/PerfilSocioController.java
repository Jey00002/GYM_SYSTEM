package pe.gym.backend.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.gym.backend.modulo_entrenamiento.entity.MedicionBiometrica;
import pe.gym.backend.modulo_entrenamiento.repository.MedicionBiometricaRepository;
import pe.gym.backend.modulo_finanzas.entity.Socio;
import pe.gym.backend.modulo_finanzas.repository.SocioRepository;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/panel-socio")
public class PerfilSocioController {

    private final UsuarioRepository usuarioRepository;
    private final SocioRepository socioRepository;
    private final MedicionBiometricaRepository medicionRepository;

    public PerfilSocioController(UsuarioRepository usuarioRepository,
                                 SocioRepository socioRepository,
                                 MedicionBiometricaRepository medicionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.socioRepository = socioRepository;
        this.medicionRepository = medicionRepository;
    }

    @PutMapping("/perfil")
    public ResponseEntity<Map<String, Object>> actualizarPerfil(@RequestBody Map<String, Object> body,
                                                                Principal principal) {
        Usuario usuario = usuarioRepository.findByCorreo(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Socio socio = socioRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Perfil de socio no encontrado"));

        if (body.get("dni") != null && !body.get("dni").toString().isBlank()) {
            socio.setDni(body.get("dni").toString());
        }
        if (body.get("telefono") != null && !body.get("telefono").toString().isBlank()) {
            socio.setTelefono(body.get("telefono").toString());
        }
        if (body.get("fechaNacimiento") != null && !body.get("fechaNacimiento").toString().isBlank()) {
            socio.setFechaNacimiento(LocalDate.parse(body.get("fechaNacimiento").toString()));
        }
        socioRepository.save(socio);

        // Peso opcional: se guarda como medicion biometrica de hoy (alimenta tu grafico de progreso)
        if (body.get("peso") != null && !body.get("peso").toString().isBlank()) {
            MedicionBiometrica med = new MedicionBiometrica();
            med.setSocio(socio);
            med.setFechaMedicion(LocalDate.now());
            med.setPeso(new BigDecimal(body.get("peso").toString()));
            medicionRepository.save(med);
        }

        return ResponseEntity.ok(Map.of(
                "mensaje", "Perfil actualizado correctamente",
                "dni", socio.getDni() == null ? "" : socio.getDni(),
                "telefono", socio.getTelefono() == null ? "" : socio.getTelefono()
        ));
    }
}
