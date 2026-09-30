package pe.gym.backend.modulo_entrenamiento.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import pe.gym.backend.modulo_finanzas.entity.Socio;

@Entity
@Table(name = "Meta_Objetivo")
@Data
@NoArgsConstructor
public class MetaObjetivo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_meta")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_socio", nullable = false)
    private Socio socio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entrenador", nullable = false)
    private Entrenador entrenador;

    @Column(name = "tipo_meta", length = 50)
    private String tipoMeta;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "fecha_limite")
    private LocalDate fechaLimite;

    @Column(name = "estado", length = 20)
    private String estado;
}
