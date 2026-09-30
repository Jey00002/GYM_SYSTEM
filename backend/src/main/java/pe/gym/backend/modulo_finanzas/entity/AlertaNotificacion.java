package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Alerta_Notificacion")
@Data
@NoArgsConstructor
public class AlertaNotificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_membresia", nullable = false)
    private Membresia membresia;

    @Column(name = "tipo_alerta", length = 50)
    private String tipoAlerta;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(name = "estado_envio", length = 20)
    private String estadoEnvio;
}
