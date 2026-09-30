package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "Plan_Membresia")
@Data
@NoArgsConstructor
public class PlanMembresia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plan")
    private Long id;

    @Column(name = "nombre_plan", length = 100, nullable = false)
    private String nombrePlan;

    @Column(name = "duracion_dias", nullable = false)
    private Integer duracionDias;

    @Column(name = "tarifa", precision = 10, scale = 2, nullable = false)
    private BigDecimal tarifa;

    @Column(name = "estado", nullable = false)
    private Boolean estado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_disciplina")
    private Disciplina disciplina;
}
