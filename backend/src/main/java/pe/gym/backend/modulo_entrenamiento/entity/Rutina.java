package pe.gym.backend.modulo_entrenamiento.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import pe.gym.backend.modulo_finanzas.entity.Socio;

@Entity
@Table(name = "Rutina")
@Data
@NoArgsConstructor
public class Rutina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rutina")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_socio", nullable = false)
    private Socio socio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entrenador", nullable = false)
    private Entrenador entrenador;

    @Column(name = "nombre_rutina", length = 100)
    private String nombreRutina;

    @Column(name = "fecha_asignacion")
    private LocalDate fechaAsignacion;

    @Column(name = "estado", length = 20)
    private String estado;
}
