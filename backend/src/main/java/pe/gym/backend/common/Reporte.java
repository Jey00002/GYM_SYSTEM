package pe.gym.backend.common;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import pe.gym.backend.modulo_seguridad.entity.Usuario;

@Entity
@Table(name = "Reporte")
@Data
@NoArgsConstructor
public class Reporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "tipo_reporte", length = 50)
    private String tipoReporte;

    @Column(name = "fecha_generacion")
    private LocalDateTime fechaGeneracion;

    @Column(name = "parametros", length = 255)
    private String parametros;

    @Column(name = "archivo_url", length = 255)
    private String archivoUrl;
}
